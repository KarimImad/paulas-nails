import express from 'express';
import pool from '../db/database.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

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

router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { service_id, slot_id, notes } = req.body;
    if (!service_id || !slot_id)
      return res.status(400).json({ message: 'Service et créneau sont requis.' });

    const slotRes = await pool.query(
      'SELECT * FROM slots WHERE id = $1 AND is_available = TRUE', [slot_id]
    );
    const slot = slotRes.rows[0];
    if (!slot) return res.status(400).json({ message: "Ce créneau n'est plus disponible." });

    const conflict = await pool.query(
      "SELECT id FROM reservations WHERE slot_id = $1 AND status != 'cancelled'", [slot_id]
    );
    if (conflict.rows.length > 0)
      return res.status(400).json({ message: "Ce créneau vient d'être réservé." });

    const userConflict = await pool.query(`
      SELECT r.id FROM reservations r
      JOIN slots sl ON r.slot_id = sl.id
      WHERE r.user_id = $1 AND sl.date = $2 AND sl.time = $3 AND r.status != 'cancelled'
    `, [req.user.id, slot.date, slot.time]);
    if (userConflict.rows.length > 0)
      return res.status(400).json({ message: 'Vous avez déjà une réservation à ce créneau.' });

    const insertRes = await pool.query(
      'INSERT INTO reservations (user_id, service_id, slot_id, notes) VALUES ($1, $2, $3, $4) RETURNING id',
      [req.user.id, service_id, slot_id, notes || null]
    );

    await pool.query('UPDATE slots SET is_available = FALSE WHERE id = $1', [slot_id]);

    const { rows } = await pool.query(`
      SELECT r.*, s.name AS service_name, s.price AS service_price,
             sl.date AS slot_date, sl.time AS slot_time
      FROM reservations r
      JOIN services s  ON r.service_id = s.id
      JOIN slots    sl ON r.slot_id    = sl.id
      WHERE r.id = $1
    `, [insertRes.rows[0].id]);

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.patch('/:id/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    if (!['pending', 'confirmed', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Statut invalide.' });

    const { rows } = await pool.query('SELECT * FROM reservations WHERE id = $1', [id]);
    const reservation = rows[0];
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable.' });

    await pool.query('UPDATE reservations SET status = $1 WHERE id = $2', [status, id]);

    if (status === 'cancelled' && reservation.status !== 'cancelled')
      await pool.query('UPDATE slots SET is_available = TRUE WHERE id = $1', [reservation.slot_id]);
    if (status !== 'cancelled' && reservation.status === 'cancelled')
      await pool.query('UPDATE slots SET is_available = FALSE WHERE id = $1', [reservation.slot_id]);

    res.json({ message: 'Statut mis à jour.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.patch('/:id/cancel', isAuthenticated, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM reservations WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    const reservation = rows[0];

    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable.' });
    if (reservation.status === 'cancelled')
      return res.status(400).json({ message: 'Cette réservation est déjà annulée.' });

    await pool.query("UPDATE reservations SET status = 'cancelled' WHERE id = $1", [reservation.id]);
    await pool.query('UPDATE slots SET is_available = TRUE WHERE id = $1', [reservation.slot_id]);

    res.json({ message: 'Réservation annulée.' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
