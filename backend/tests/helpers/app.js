'use strict';

const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let cachedApp;
let cachedMongoose;

async function setupTestDb() {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();

  // Require mongoose AFTER MONGODB_URI is set so that any downstream `config/env.js`
  // (also loaded after) sees the right value.
  cachedMongoose = require('mongoose');
  await cachedMongoose.connect(process.env.MONGODB_URI);
  return process.env.MONGODB_URI;
}

async function teardownTestDb() {
  if (cachedMongoose) await cachedMongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
}

function freshApp() {
  // Reuse the same module graph so we don't end up with two mongoose instances.
  if (!cachedApp) {
    cachedApp = require('../../src/app').createApp();
  }
  return cachedApp;
}

module.exports = { setupTestDb, teardownTestDb, freshApp };
