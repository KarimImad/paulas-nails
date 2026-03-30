import pg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pg;

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'paulas_nails',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD,
});

export async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS session (
      sid    VARCHAR     NOT NULL COLLATE "default",
      sess   JSON        NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE
    );
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         SERIAL PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT,
      role       TEXT DEFAULT 'user',
      phone      TEXT,
      google_id  TEXT UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT,
      duration    INTEGER NOT NULL,
      price       REAL NOT NULL,
      category    TEXT DEFAULT 'standard',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS slots (
      id           SERIAL PRIMARY KEY,
      date         TEXT NOT NULL,
      time         TEXT NOT NULL,
      is_available BOOLEAN DEFAULT TRUE,
      created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(date, time)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id         SERIAL PRIMARY KEY,
      user_id    INTEGER NOT NULL REFERENCES users(id),
      service_id INTEGER NOT NULL REFERENCES services(id),
      slot_id    INTEGER NOT NULL REFERENCES slots(id),
      status     TEXT DEFAULT 'pending',
      notes      TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE`);
  await pool.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL`);

  const adminRes = await pool.query('SELECT id FROM users WHERE email = $1', ['admin@paulasnails.fr']);
  if (adminRes.rows.length === 0) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error('ADMIN_PASSWORD must be set in .env');
    const hash = await bcrypt.hash(adminPassword, 12);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['Admin', 'admin@paulasnails.fr', hash, 'admin']
    );
  }

  const countRes = await pool.query('SELECT COUNT(*) AS c FROM services');
  if (parseInt(countRes.rows[0].c) === 0) {
    const services = [
      ['Pose semi-permanent', "Application d'un vernis semi-permanent longue durée, jusqu'à 3 semaines de tenue parfaite.", 45, 35, 'vernis'],
      ['Manucure classique', 'Soin complet des mains : lime, cuticules, massage et pose de vernis au choix.', 60, 30, 'soin'],
      ['Pose gel couleur', 'Extension ou renforcement en gel avec couleur au choix, pour des ongles solides et brillants.', 90, 60, 'gel'],
      ['Baby boomer', "L'iconique dégradé rose et blanc en gel, élégant et intemporel.", 90, 70, 'gel'],
      ['Nail art', "Décoration sur mesure : dégradés, motifs, strass, poudres chrome — laissez libre cours à votre créativité.", 120, 80, 'art'],
      ['Retouche gel', 'Retouche de la repousse et réparation des ongles en gel existants.', 60, 45, 'gel'],
      ['Dépose gel', "Retrait soigneux du gel en respectant l'intégrité de l'ongle naturel.", 30, 20, 'soin'],
      ['Soin des mains', 'Gommage, masque, massage prolongé et hydratation intense des mains et avant-bras.', 45, 40, 'soin'],
    ];
    for (const [name, description, duration, price, category] of services) {
      await pool.query(
        'INSERT INTO services (name, description, duration, price, category) VALUES ($1, $2, $3, $4, $5)',
        [name, description, duration, price, category]
      );
    }
  }

  console.log('  ✦ Base de données prête.');
}

export default pool;
