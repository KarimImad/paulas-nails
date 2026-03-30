import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectPgSimple from 'connect-pg-simple';

import pool, { initDB } from './db/database.js';
import authRouter from './routes/auth.js';
import servicesRouter from './routes/services.js';
import slotsRouter from './routes/slots.js';
import reservationsRouter from './routes/reservations.js';

if (!process.env.SESSION_SECRET) throw new Error('SESSION_SECRET must be set');
if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL must be set in production');
}

const PgSession = connectPgSimple(session);
const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true,
// }));

app.use(cors({
  origin: process.env.FRONTEND_URL.split(',').map(url => url.trim()),
  credentials: true,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes.' },
});

app.use(session({
  store: new PgSession({ pool, tableName: 'session' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  async (email, password, done) => {
    try {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
      const user = rows[0];
      if (!user || !user.password) return done(null, false, { message: 'Email ou mot de passe incorrect.' });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return done(null, false, { message: 'Email ou mot de passe incorrect.' });
      const { password: _, ...safe } = user;
      return done(null, safe);
    } catch (err) {
      return done(err);
    }
  }
));

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const existing = await pool.query(
        'SELECT id, name, email, role, phone FROM users WHERE google_id = $1',
        [profile.id]
      );
      if (existing.rows.length > 0) return done(null, existing.rows[0]);

      const byEmail = await pool.query(
        'SELECT id, name, email, role, phone FROM users WHERE email = $1',
        [email]
      );
      if (byEmail.rows.length > 0) {
        await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [profile.id, byEmail.rows[0].id]);
        return done(null, byEmail.rows[0]);
      }

      const result = await pool.query(
        'INSERT INTO users (name, email, google_id) VALUES ($1, $2, $3) RETURNING id, name, email, role, phone',
        [profile.displayName, email, profile.id]
      );
      return done(null, result.rows[0]);
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

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/reservations', reservationsRouter);


app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Erreur serveur.' : err.message;
  res.status(status).json({ message });
});

try {
  await initDB();
  app.listen(PORT, () => {
    console.log(`\n  ✦ Paula's Nails API — http://localhost:${PORT}\n`);
  });
} catch (err) {
  console.error('Erreur de démarrage :', err.message);
  process.exit(1);
}
