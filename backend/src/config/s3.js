'use strict';

const { S3Client } = require('@aws-sdk/client-s3');
const env = require('./env');

const credentials =
  env.aws.accessKeyId && env.aws.secretAccessKey
    ? {
        accessKeyId: env.aws.accessKeyId,
        secretAccessKey: env.aws.secretAccessKey,
      }
    : undefined;

const s3Client = new S3Client({
  region: env.aws.region,
  credentials,
});

module.exports = { s3Client, bucket: env.aws.bucket };
