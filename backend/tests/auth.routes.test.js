import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock base de données — doit être déclaré avant les imports des routes
vi.mock('../db/database.js', () => ({
  default: { query: vi.fn() },
}));

import pool from '../db/database.js';
import authRouter from '../routes/auth.js';

function createApp() {
  const app = express();
  app.use(express.json());
  // Simule les méthodes Passport injectées par express-session
  app.use((req, _res, next) => {
    req.login = (_user, cb) => cb(null);
    req.isAuthenticated = () => false;
    next();
  });
  app.use('/api/auth', authRouter);
  return app;
}

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retourne 400 si les champs obligatoires sont manquants', async () => {
    const res = await request(createApp())
      .post('/api/auth/register')
      .send({ email: 'test@test.com' }); // name et password manquants

    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  it('retourne 400 si le mot de passe est trop court (< 8 caractères)', async () => {
    const res = await request(createApp())
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/8/);
  });

  it('retourne 400 si l\'email est déjà utilisé', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // email déjà en base

    const res = await request(createApp())
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'existant@test.com', password: 'motdepasse123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/déjà/);
  });

  it('crée le compte et retourne 201 si les données sont valides', async () => {
    pool.query
      .mockResolvedValueOnce({ rows: [] })                              // email libre
      .mockResolvedValueOnce({ rows: [{ id: 42 }] })                   // INSERT RETURNING id
      .mockResolvedValueOnce({ rows: [{ id: 42, name: 'Test', email: 'test@test.com', role: 'user', phone: null }] }); // SELECT user

    const res = await request(createApp())
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: 'motdepasse123' });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ id: 42, name: 'Test', role: 'user' });
  });
});

describe('GET /api/auth/me', () => {
  it('retourne { user: null } si non connecté', async () => {
    const res = await request(createApp()).get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });
});
