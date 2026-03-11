import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import cors from 'cors';
import memoryStoreFactory from 'memorystore';

import pool, { initDB } from './db/database.js';
import authRouter from './routes/auth.js';
import servicesRouter from './routes/services.js';
import slotsRouter from './routes/slots.js';
import reservationsRouter from './routes/reservations.js';

const MemoryStore = memoryStoreFactory(session);
const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// ─── Session ──────────────────────────────────────────────────────────────────
app.use(session({
  store: new MemoryStore({ checkPeriod: 86400000 }),
  secret: process.env.SESSION_SECRET || 'nail_salon_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

// ─── Passport ─────────────────────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      const user = rows[0];
      if (!user) return done(null, false, { message: 'Email ou mot de passe incorrect.' });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return done(null, false, { message: 'Email ou mot de passe incorrect.' });
      const { password: _, ...safe } = user;
      return done(null, safe);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, email, role, phone FROM users WHERE id = $1', [id]
    );
    done(null, rows[0] || false);
  } catch (err) {
    done(err);
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/reservations', reservationsRouter);

// ─── Start ────────────────────────────────────────────────────────────────────
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  ✦ Paula's Nails API — http://localhost:${PORT}\n`);
  });
}).catch(err => {
  console.error('Erreur de connexion à la base de données :', err.message);
  process.exit(1);
});
