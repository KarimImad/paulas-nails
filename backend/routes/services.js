import express from 'express';
import pool from '../db/database.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const { rows } = await pool.query('SELECT * FROM services ORDER BY category, name');
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM services WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ message: 'Service introuvable.' });
  res.json(rows[0]);
});

router.post('/', isAdmin, async (req, res) => {
  const { name, description, duration, price, category } = req.body;
  if (!name || !duration || !price)
    return res.status(400).json({ message: 'Nom, durée et prix sont requis.' });

  try {
    const { rows } = await pool.query(
      'INSERT INTO services (name, description, duration, price, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name.trim(), description || '', parseInt(duration), parseFloat(price), category || 'standard']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  const { name, description, duration, price, category } = req.body;
  const { id } = req.params;

  const exists = await pool.query('SELECT id FROM services WHERE id = $1', [id]);
  if (!exists.rows[0]) return res.status(404).json({ message: 'Service introuvable.' });

  const { rows } = await pool.query(
    'UPDATE services SET name = $1, description = $2, duration = $3, price = $4, category = $5 WHERE id = $6 RETURNING *',
    [name.trim(), description || '', parseInt(duration), parseFloat(price), category, id]
  );
  res.json(rows[0]);
});

router.delete('/:id', isAdmin, async (req, res) => {
  const { id } = req.params;
  const active = await pool.query(
    "SELECT id FROM reservations WHERE service_id = $1 AND status != 'cancelled'", [id]
  );
  if (active.rows.length > 0)
    return res.status(400).json({ message: 'Ce service possède des réservations actives.' });

  await pool.query('DELETE FROM services WHERE id = $1', [id]);
  res.json({ message: 'Service supprimé.' });
});

export default router;
