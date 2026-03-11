import { describe, it, expect, vi } from 'vitest';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

describe('isAuthenticated', () => {
  it('appelle next() si utilisateur connecté', () => {
    const req = { isAuthenticated: () => true };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('retourne 401 si utilisateur non connecté', () => {
    const req = { isAuthenticated: () => false };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    expect(next).not.toHaveBeenCalled();
  });
});

describe('isAdmin', () => {
  it('appelle next() si utilisateur admin connecté', () => {
    const req = { isAuthenticated: () => true, user: { role: 'admin' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    isAdmin(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('retourne 403 si rôle user (non admin)', () => {
    const req = { isAuthenticated: () => true, user: { role: 'user' } };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('retourne 403 si non connecté', () => {
    const req = { isAuthenticated: () => false };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    isAdmin(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
