import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import pool from '../db/database.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

const PHONE_RE = /^[+\d\s\-().]{6,20}$/;

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Données invalides.' });
  if (password.length < 8 || password.length > 128)
    return res.status(400).json({ message: 'Le mot de passe doit contenir entre 8 et 128 caractères.' });
  if (phone && !PHONE_RE.test(phone))
    return res.status(400).json({ message: 'Format de numéro invalide.' });

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Cet email est déjà associé à un compte.' });

    const hash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [name.trim(), email.toLowerCase(), hash, phone || null]
    );

    const userRes = await pool.query(
      'SELECT id, name, email, role, phone FROM users WHERE id = $1',
      [result.rows[0].id]
    );
    const user = userRes.rows[0];

    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la connexion automatique.' });
      res.status(201).json({ user });
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur.' });
    if (!user) return res.status(401).json({ message: info?.message || 'Identifiants incorrects.' });
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Erreur lors de la connexion.' });
      res.json({ user });
    });
  })(req, res, next);
});

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la déconnexion.' });
    res.json({ message: 'Déconnecté avec succès.' });
  });
});

router.get('/me', (req, res) => {
  if (req.isAuthenticated()) return res.json({ user: req.user });
  res.json({ user: null });
});

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/connexion` }),
  (req, res) => {
    if (req.user.role === 'admin') return res.redirect(`${process.env.FRONTEND_URL}/admin`);
    if (!req.user.phone) return res.redirect(`${process.env.FRONTEND_URL}/completer-profil`);
    res.redirect(`${process.env.FRONTEND_URL}/bienvenue`);
  }
);

router.delete('/account', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Non authentifié.' });
  if (req.user.role === 'admin') return res.status(403).json({ message: 'Impossible de supprimer le compte admin.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Libérer les créneaux des réservations actives
    await client.query(`
      UPDATE slots SET is_available = TRUE
      WHERE id IN (
        SELECT slot_id FROM reservations
        WHERE user_id = $1 AND status != 'cancelled'
      )
    `, [req.user.id]);

    // Supprimer les réservations
    await client.query('DELETE FROM reservations WHERE user_id = $1', [req.user.id]);

    // Supprimer le compte
    await client.query('DELETE FROM users WHERE id = $1', [req.user.id]);

    await client.query('COMMIT');

    req.logout((err) => {
      if (err) console.error('[delete-account] logout error:', err.message);
      req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.json({ message: 'Compte et données supprimés.' });
      });
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erreur serveur.' });
  } finally {
    client.release();
  }
});

router.patch('/profile', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Non authentifié.' });

  const { phone } = req.body;
  if (!phone || !PHONE_RE.test(phone))
    return res.status(400).json({ message: 'Format de numéro invalide.' });

  try {
    const result = await pool.query(
      'UPDATE users SET phone = $1 WHERE id = $2 RETURNING id, name, email, role, phone',
      [phone, req.user.id]
    );
    req.user.phone = result.rows[0].phone;
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.get('/users/count', isAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    res.json({ count: parseInt(rows[0].count, 10) });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
