import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// mockClient créé avant le hoisting de vi.mock
const mockClient = vi.hoisted(() => ({
  query:   vi.fn(),
  release: vi.fn(),
}));

vi.mock('../db/database.js', () => ({
  default: {
    query:   vi.fn(),
    connect: vi.fn(),
  },
}));

vi.mock('../middleware/auth.js', () => ({
  isAuthenticated: (req, _res, next) => { req.user = { id: 1, role: 'user' }; next(); },
  isAdmin:         (req, _res, next) => { req.user = { id: 1, role: 'admin' }; next(); },
}));

import pool from '../db/database.js';
import reservationsRouter from '../routes/reservations.js';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/reservations', reservationsRouter);
  return app;
}

// Réinitialise tous les mocks entre chaque test
function resetMocks() {
  vi.resetAllMocks();
  pool.connect.mockResolvedValue(mockClient);
  mockClient.query.mockResolvedValue({ rows: [] });
  mockClient.release.mockResolvedValue();
}

describe('POST /api/reservations — création de réservation', () => {
  beforeEach(resetMocks);

  it('retourne 400 si service_id ou slot_id est manquant', async () => {
    const res = await request(createApp())
      .post('/api/reservations')
      .send({ service_id: 1 }); // slot_id manquant

    expect(res.status).toBe(400);
    expect(res.body.message).toBeTruthy();
  });

  it("retourne 400 si le créneau n'est pas disponible", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })  // BEGIN
      .mockResolvedValueOnce({ rows: [] }); // SELECT slot (introuvable)

    const res = await request(createApp())
      .post('/api/reservations')
      .send({ service_id: 1, slot_id: 99 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/disponible/);
  });

  it('retourne 400 si le créneau est déjà réservé (conflit)', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 99, date: '2025-06-01', time: '10:00:00', is_available: true }] }) // slot OK
      .mockResolvedValueOnce({ rows: [{ id: 5 }] }); // conflit détecté

    const res = await request(createApp())
      .post('/api/reservations')
      .send({ service_id: 1, slot_id: 99 });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/réservé/);
  });

  it('crée la réservation et retourne 201 si tout est valide', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 10, date: '2025-06-01', time: '10:00:00', is_available: true }] }) // slot
      .mockResolvedValueOnce({ rows: [] }) // pas de conflit
      .mockResolvedValueOnce({ rows: [] }) // pas de conflit utilisateur
      .mockResolvedValueOnce({ rows: [{ id: 7 }] }) // INSERT réservation
      .mockResolvedValueOnce({ rows: [] }) // UPDATE slot
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    pool.query.mockResolvedValueOnce({ rows: [{
      id: 7, user_id: 1, service_id: 1, slot_id: 10,
      status: 'confirmed', notes: null,
      service_name: 'Pose gel couleur', service_price: 60, service_duration: 60,
      slot_date: '2025-06-01', slot_time: '10:00:00',
    }] });

    const res = await request(createApp())
      .post('/api/reservations')
      .send({ service_id: 1, slot_id: 10 });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 7, status: 'confirmed' });
  });
});

describe("PATCH /api/reservations/:id/cancel — annulation par l'utilisateur", () => {
  beforeEach(resetMocks);

  it('retourne 400 si la réservation est déjà annulée', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 3, user_id: 1, slot_id: 10, status: 'cancelled' }] }); // SELECT

    const res = await request(createApp())
      .patch('/api/reservations/3/cancel');

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/déjà annulée/);
  });

  it('annule la réservation et libère le créneau', async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] }) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 3, user_id: 1, slot_id: 10, status: 'pending' }] }) // SELECT
      .mockResolvedValueOnce({ rows: [] }) // UPDATE reservations
      .mockResolvedValueOnce({ rows: [] }) // UPDATE slots
      .mockResolvedValueOnce({ rows: [] }); // COMMIT

    pool.query.mockResolvedValue({ rows: [] }); // requête mail (fire-and-forget)

    const res = await request(createApp())
      .patch('/api/reservations/3/cancel');

    expect(res.status).toBe(200);
    expect(res.body.message).toBeTruthy();
  });
});

describe('PATCH /api/reservations/:id/status — mise à jour statut (admin)', () => {
  beforeEach(resetMocks);

  it('retourne 400 si le statut est invalide', async () => {
    const res = await request(createApp())
      .patch('/api/reservations/1/status')
      .send({ status: 'invalide' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Statut invalide/);
  });
});
