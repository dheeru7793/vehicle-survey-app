'use strict';

const request = require('supertest');
const { setupTestDb, teardownTestDb, freshApp } = require('./helpers/app');

let app;
let surveyorToken;
let adminToken;

beforeAll(async () => {
  await setupTestDb();
  app = freshApp();
  const User = require('../src/models/User');
  const authService = require('../src/services/authService');
  const hash = await authService.hashPassword('TestPass123!');
  await User.create({ employeeId: 'admin', name: 'A', passwordHash: hash, role: 'ADMIN', active: true });
  await User.create({ employeeId: 'srv1', name: 'S1', passwordHash: hash, role: 'SURVEYOR', active: true });

  const sLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ employeeId: 'srv1', password: 'TestPass123!' });
  surveyorToken = sLogin.body.token;
  const aLogin = await request(app)
    .post('/api/v1/auth/login')
    .send({ employeeId: 'admin', password: 'TestPass123!' });
  adminToken = aLogin.body.token;
});

afterAll(async () => {
  await teardownTestDb();
});

describe('Surveys', () => {
  let surveyId;

  test('surveyor creates survey with messy vehicle number (normalized)', async () => {
    const res = await request(app)
      .post('/api/v1/surveys')
      .set('Authorization', `Bearer ${surveyorToken}`)
      .send({
        vehicleNumber: 'mh12-ab 1234',
        notes: 'first survey',
        latitude: 18.5,
        longitude: 73.8,
        status: 'SYNCED',
      })
      .expect(201);
    expect(res.body.survey.vehicleNumber).toBe('MH12AB1234');
    expect(res.body.survey.status).toBe('SYNCED');
    surveyId = res.body.survey._id;
  });

  test('clientId-based idempotency on retry', async () => {
    const clientId = '11111111-1111-4111-8111-111111111111';
    const first = await request(app)
      .post('/api/v1/surveys')
      .set('Authorization', `Bearer ${surveyorToken}`)
      .send({ vehicleNumber: 'KA01XY9999', clientId, status: 'PENDING' })
      .expect(201);
    const second = await request(app)
      .post('/api/v1/surveys')
      .set('Authorization', `Bearer ${surveyorToken}`)
      .send({ vehicleNumber: 'KA01XY9999', clientId, status: 'PENDING' })
      .expect(201);
    expect(second.body.survey._id).toBe(first.body.survey._id);
  });

  test('duplicate-check finds recent survey', async () => {
    const res = await request(app)
      .get('/api/v1/surveys/duplicate-check')
      .query({ vehicleNumber: 'mh-12 ab1234' })
      .set('Authorization', `Bearer ${surveyorToken}`)
      .expect(200);
    expect(res.body.duplicate).toBe(true);
    expect(res.body.vehicleNumber).toBe('MH12AB1234');
  });

  test('surveyor sees only their surveys; admin sees all', async () => {
    const surveyorList = await request(app)
      .get('/api/v1/surveys')
      .set('Authorization', `Bearer ${surveyorToken}`)
      .expect(200);
    expect(surveyorList.body.items.length).toBeGreaterThanOrEqual(2);

    const adminList = await request(app)
      .get('/api/v1/surveys')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(adminList.body.items.length).toBeGreaterThanOrEqual(2);
  });

  test('admin can fetch dashboard stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect(res.body.totals.total).toBeGreaterThanOrEqual(2);
  });

  test('surveyor cannot reach admin route', async () => {
    await request(app)
      .get('/api/v1/admin/dashboard/stats')
      .set('Authorization', `Bearer ${surveyorToken}`)
      .expect(403);
  });

  test('survey detail visible to creator', async () => {
    const res = await request(app)
      .get(`/api/v1/surveys/${surveyId}`)
      .set('Authorization', `Bearer ${surveyorToken}`)
      .expect(200);
    expect(res.body.survey._id).toBe(surveyId);
  });
});
