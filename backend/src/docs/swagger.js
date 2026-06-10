'use strict';

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Vehicle Survey API',
      version: '1.0.0',
      description: 'REST API for the Vehicle Survey mobile app and admin portal.',
    },
    servers: [
      { url: 'http://localhost:4000/api/v1', description: 'Local dev' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            employeeId: { type: 'string' },
            name: { type: 'string' },
            mobile: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'SURVEYOR'] },
            active: { type: 'boolean' },
            lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Survey: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            vehicleNumber: { type: 'string', example: 'MH12AB1234' },
            surveyorId: { type: 'string' },
            surveyorName: { type: 'string' },
            notes: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: {
                  type: 'array',
                  items: { type: 'number' },
                  example: [73.8567, 18.5204],
                },
              },
            },
            status: { type: 'string', enum: ['DRAFT', 'PENDING', 'UPLOADING', 'SYNCED', 'FAILED'] },
            photoCount: { type: 'integer' },
            clientId: { type: 'string', nullable: true },
            syncedAt: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        SurveyPhoto: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            surveyId: { type: 'string' },
            vehicleNumber: { type: 'string' },
            s3Key: { type: 'string' },
            s3ThumbKey: { type: 'string' },
            sequenceNo: { type: 'integer' },
            sizeBytes: { type: 'integer' },
            mimeType: { type: 'string' },
            uploadedAt: { type: 'string', format: 'date-time' },
            url: { type: 'string', description: 'Signed URL (full-size), included on read.' },
            thumbUrl: { type: 'string', description: 'Signed URL (thumbnail), included on read.' },
          },
        },
        ErrorEnvelope: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                status: { type: 'integer' },
                message: { type: 'string' },
                details: { type: 'object', nullable: true },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(__dirname, '..', 'routes', '*.js')],
});

function mountSwagger(app) {
  app.get('/api/docs.json', (_req, res) => res.json(spec));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, { explorer: true }));
}

module.exports = { mountSwagger, spec };
