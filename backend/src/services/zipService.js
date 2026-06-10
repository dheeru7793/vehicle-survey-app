'use strict';

const archiver = require('archiver');
const s3Service = require('./s3Service');

/**
 * Stream a ZIP of every full-size photo for the given survey into res.
 */
async function streamSurveyZip({ res, survey, photos }) {
  const fileName = `${survey.vehicleNumber}.zip`;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

  const archive = archiver('zip', { zlib: { level: 5 } });
  archive.on('error', (err) => {
    res.status(500);
    res.end(err.message);
  });
  archive.pipe(res);

  for (const photo of photos) {
    const stream = await s3Service.getObjectStream(photo.s3Key);
    const seq = String(photo.sequenceNo).padStart(3, '0');
    const ext = (photo.mimeType || 'image/jpeg').split('/')[1] || 'jpg';
    archive.append(stream, { name: `${survey.vehicleNumber}_${seq}.${ext}` });
  }

  await archive.finalize();
}

module.exports = { streamSurveyZip };
