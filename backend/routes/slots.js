import express from 'express';
import pool from '../db/database.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// User: available slots
router.get('/available', isAuthenticated, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(
    'SELECT * FROM slots WHERE is_available = TRUE AND date >= $1 ORDER BY date, time',
    [today]
  );
  res.json(rows);
});

// Admin: all future slots with reservation info
router.get('/', isAdmin, async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const { rows } = await pool.query(`
    SELECT s.*, r.id AS reservation_id, r.status AS reservation_status,
           u.name AS client_name
    FROM slots s
    LEFT JOIN reservations r ON s.id = r.slot_id AND r.status != 'cancelled'
    LEFT JOIN users u ON r.user_id = u.id
    WHERE s.date >= $1
    ORDER BY s.date, s.time
  `, [today]);
  res.json(rows);
});

// Admin: create a single slot
router.post('/', isAdmin, async (req, res) => {
  const { date, time } = req.body;
  if (!date || !time) return res.status(400).json({ message: 'Date et heure requises.' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO slots (date, time) VALUES ($1, $2) RETURNING *',
      [date, time]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ message: 'Ce créneau existe déjà.' });
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

// Admin: create multiple slots for a date
router.post('/bulk', isAdmin, async (req, res) => {
  const { date, times } = req.body;
  if (!date || !Array.isArray(times) || times.length === 0)
    return res.status(400).json({ message: "Date et liste d'heures requises." });

  let created = 0;
  for (const time of times) {
    const result = await pool.query(
      'INSERT INTO slots (date, time) VALUES ($1, $2) ON CONFLICT (date, time) DO NOTHING RETURNING id',
      [date, time]
    );
    if (result.rowCount > 0) created++;
  }

  res.status(201).json({ message: `${created} créneau(x) créé(s) sur ${times.length}.` });
});

// Admin: delete a slot
router.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const active = await pool.query(
    "SELECT id FROM reservations WHERE slot_id = $1 AND status != 'cancelled'", [id]
  );
  if (active.rows.length > 0)
    return res.status(400).json({ message: 'Ce créneau a une réservation active.' });

  await pool.query('DELETE FROM slots WHERE id = $1', [id]);
  res.json({ message: 'Créneau supprimé.' });
});

export default router;
