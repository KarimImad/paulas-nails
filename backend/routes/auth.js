import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import pool from '../db/database.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis.' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });

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
    console.error(err);
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
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
);

router.patch('/profile', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Non authentifié.' });
  const { phone } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET phone = $1 WHERE id = $2 RETURNING id, name, email, role, phone',
      [phone || null, req.user.id]
    );
    req.user.phone = result.rows[0].phone;
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
