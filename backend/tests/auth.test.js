'use strict';

const request = require('supertest');
const { setupTestDb, teardownTestDb, freshApp } = require('./helpers/app');

let app;
let User;
let authService;

beforeAll(async () => {
  await setupTestDb();
  app = freshApp();
  User = require('../src/models/User');
  authService = require('../src/services/authService');
  const hash = await authService.hashPassword('TestPass123!');
  await User.create({
    employeeId: 'admin',
    name: 'Admin',
    mobile: '',
    passwordHash: hash,
    role: 'ADMIN',
    active: true,
  });
  await User.create({
    employeeId: 'srv1',
    name: 'Surveyor One',
    mobile: '9999',
    passwordHash: hash,
    role: 'SURVEYOR',
    active: true,
  });
});

afterAll(async () => {
  await teardownTestDb();
});

describe('Auth', () => {
  test('login returns JWT', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ employeeId: 'admin', password: 'TestPass123!' })
      .expect(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('ADMIN');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  test('login rejects bad password', async () => {
    await request(app)
      .post('/api/v1/auth/login')
      .send({ employeeId: 'admin', password: 'wrong' })
      .expect(401);
  });

  test('/auth/me requires token', async () => {
    await request(app).get('/api/v1/auth/me').expect(401);
  });

  test('/auth/me works with token', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ employeeId: 'srv1', password: 'TestPass123!' });
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(200);
    expect(res.body.user.employeeId).toBe('srv1');
  });
});
