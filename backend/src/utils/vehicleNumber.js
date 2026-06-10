'use strict';

/**
 * Normalize a raw vehicle number string:
 *   "mh12-ab 1234" -> "MH12AB1234"
 * Removes spaces, hyphens, dots, and uppercases.
 */
function normalizeVehicleNumber(input) {
  if (input === null || input === undefined) return '';
  return String(input).replace(/[\s\-._]/g, '').toUpperCase();
}

const VEHICLE_NUMBER_REGEX = /^[A-Z0-9]{4,12}$/;

function isValidVehicleNumber(normalized) {
  return VEHICLE_NUMBER_REGEX.test(normalized);
}

module.exports = {
  normalizeVehicleNumber,
  isValidVehicleNumber,
  VEHICLE_NUMBER_REGEX,
};
