import express from 'express';
import pool from '../db/database.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import {
  sendReservationConfirmation,
  sendReservationCancellation,
  sendAdminNewReservation,
} from '../services/mailer.js';

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /my — réservations de l'utilisateur connecté
// ---------------------------------------------------------------------------

router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*,
             s.name AS service_name, s.price AS service_price, s.duration AS service_duration,
             sl.date AS slot_date, sl.time AS slot_time
      FROM reservations r
      JOIN services s  ON r.service_id = s.id
      JOIN slots    sl ON r.slot_id    = sl.id
      WHERE r.user_id = $1
      ORDER BY sl.date DESC, sl.time DESC
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ---------------------------------------------------------------------------
// GET / — toutes les réservations (admin)
// ---------------------------------------------------------------------------

router.get('/', isAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*,
             u.name  AS user_name,  u.email AS user_email, u.phone AS user_phone,
             s.name  AS service_name, s.price AS service_price, s.duration AS service_duration,
             sl.date AS slot_date, sl.time AS slot_time
      FROM reservations r
      JOIN users    u  ON r.user_id    = u.id
      JOIN services s  ON r.service_id = s.id
      JOIN slots    sl ON r.slot_id    = sl.id
      ORDER BY sl.date DESC, sl.time DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// ---------------------------------------------------------------------------
// POST / — créer une réservation (auto-confirmée)
// ---------------------------------------------------------------------------

router.post('/', isAuthenticated, async (req, res) => {
  const client = await pool.connect();
  try {
    const { service_id, slot_id, notes } = req.body;
    if (!service_id || !slot_id)
      return res.status(400).json({ message: 'Service et créneau sont requis.' });

    await client.query('BEGIN');

    const slotRes = await client.query(
      'SELECT * FROM slots WHERE id = $1 AND is_available = TRUE FOR UPDATE', [slot_id]
    );
    const slot = slotRes.rows[0];
    if (!slot) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Ce créneau n'est plus disponible." });
    }

    const conflict = await client.query(
      "SELECT id FROM reservations WHERE slot_id = $1 AND status != 'cancelled'", [slot_id]
    );
    if (conflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: "Ce créneau vient d'être réservé." });
    }

    const userConflict = await client.query(`
      SELECT r.id FROM reservations r
      JOIN slots sl ON r.slot_id = sl.id
      WHERE r.user_id = $1 AND sl.date = $2 AND sl.time = $3 AND r.status != 'cancelled'
    `, [req.user.id, slot.date, slot.time]);
    if (userConflict.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Vous avez déjà une réservation à ce créneau.' });
    }

    const insertRes = await client.query(
      "INSERT INTO reservations (user_id, service_id, slot_id, status, notes) VALUES ($1, $2, $3, 'confirmed', $4) RETURNING id",
      [req.user.id, service_id, slot_id, notes || null]
    );

    await client.query('UPDATE slots SET is_available = FALSE WHERE id = $1', [slot_id]);

    await client.query('COMMIT');

    const { rows } = await pool.query(`
      SELECT r.*, s.name AS service_name, s.price AS service_price, s.duration AS service_duration,
             sl.date AS slot_date, sl.time AS slot_time
      FROM reservations r
      JOIN services s  ON r.service_id = s.id
      JOIN slots    sl ON r.slot_id    = sl.id
      WHERE r.id = $1
    `, [insertRes.rows[0].id]);

    const reservation = rows[0];
    const mailData = {
      serviceName:     reservation.service_name,
      servicePrice:    reservation.service_price,
      serviceDuration: reservation.service_duration,
      slotDate:        reservation.slot_date,
      slotTime:        reservation.slot_time,
    };

    // Mail de confirmation au client
    sendReservationConfirmation({
      to:       req.user.email,
      userName: req.user.name,
      ...mailData,
    }).catch(err => console.error('[mailer:confirmation]', err.message));

    // Notification à l'admin
    sendAdminNewReservation({
      clientName:  req.user.name,
      clientEmail: req.user.email,
      clientPhone: req.user.phone || null,
      notes:       notes || null,
      ...mailData,
    }).catch(err => console.error('[mailer:admin]', err.message));

    res.status(201).json(reservation);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erreur serveur.' });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/status — changer le statut (admin)
// ---------------------------------------------------------------------------

router.patch('/:id/status', isAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!['pending', 'confirmed', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Statut invalide.' });

    await client.query('BEGIN');

    const { rows } = await client.query('SELECT * FROM reservations WHERE id = $1 FOR UPDATE', [id]);
    const reservation = rows[0];
    if (!reservation) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Réservation introuvable.' });
    }

    await client.query('UPDATE reservations SET status = $1 WHERE id = $2', [status, id]);

    if (status === 'cancelled' && reservation.status !== 'cancelled')
      await client.query('UPDATE slots SET is_available = TRUE WHERE id = $1', [reservation.slot_id]);
    if (status !== 'cancelled' && reservation.status === 'cancelled')
      await client.query('UPDATE slots SET is_available = FALSE WHERE id = $1', [reservation.slot_id]);

    await client.query('COMMIT');

    // Mail d'annulation au client si l'admin annule
    if (status === 'cancelled' && reservation.status !== 'cancelled') {
      pool.query(`
        SELECT u.name, u.email, s.name AS service_name, s.price AS service_price, s.duration AS service_duration,
               sl.date AS slot_date, sl.time AS slot_time
        FROM reservations r
        JOIN users    u  ON r.user_id    = u.id
        JOIN services s  ON r.service_id = s.id
        JOIN slots    sl ON r.slot_id    = sl.id
        WHERE r.id = $1
      `, [id]).then(({ rows: rr }) => {
        if (!rr[0]) return;
        const r = rr[0];
        sendReservationCancellation({
          to:              r.email,
          userName:        r.name,
          serviceName:     r.service_name,
          servicePrice:    r.service_price,
          serviceDuration: r.service_duration,
          slotDate:        r.slot_date,
          slotTime:        r.slot_time,
          cancelledByAdmin: true,
        }).catch(err => console.error('[mailer:cancel-admin]', err.message));
      }).catch(() => {});
    }

    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erreur serveur.' });
  } finally {
    client.release();
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/cancel — annulation par le client
// ---------------------------------------------------------------------------

router.patch('/:id/cancel', isAuthenticated, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT * FROM reservations WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    );
    const reservation = rows[0];

    if (!reservation) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Réservation introuvable.' });
    }
    if (reservation.status === 'cancelled') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Cette réservation est déjà annulée.' });
    }

    await client.query("UPDATE reservations SET status = 'cancelled' WHERE id = $1", [reservation.id]);
    await client.query('UPDATE slots SET is_available = TRUE WHERE id = $1', [reservation.slot_id]);

    await client.query('COMMIT');

    // Mail d'annulation au client
    pool.query(`
      SELECT s.name AS service_name, s.price AS service_price, s.duration AS service_duration,
             sl.date AS slot_date, sl.time AS slot_time
      FROM reservations r
      JOIN services s ON r.service_id = s.id
      JOIN slots   sl ON r.slot_id    = sl.id
      WHERE r.id = $1
    `, [reservation.id]).then(({ rows: rr }) => {
      if (!rr[0]) return;
      const r = rr[0];
      sendReservationCancellation({
        to:              req.user.email,
        userName:        req.user.name,
        serviceName:     r.service_name,
        servicePrice:    r.service_price,
        serviceDuration: r.service_duration,
        slotDate:        r.slot_date,
        slotTime:        r.slot_time,
        cancelledByAdmin: false,
      }).catch(err => console.error('[mailer:cancel-user]', err.message));
    }).catch(() => {});

    res.json({ message: 'Réservation annulée.' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erreur serveur.' });
  } finally {
    client.release();
  }
});

export default router;
