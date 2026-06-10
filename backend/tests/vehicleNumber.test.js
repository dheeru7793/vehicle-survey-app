'use strict';

const { normalizeVehicleNumber, isValidVehicleNumber } = require('../src/utils/vehicleNumber');

describe('vehicleNumber utils', () => {
  test('normalizes spaces, dashes and case', () => {
    expect(normalizeVehicleNumber('mh12-ab 1234')).toBe('MH12AB1234');
    expect(normalizeVehicleNumber('  MH 14 XY 5678  ')).toBe('MH14XY5678');
    expect(normalizeVehicleNumber('mh.12.ab.1234')).toBe('MH12AB1234');
    expect(normalizeVehicleNumber(null)).toBe('');
  });

  test('validates regex', () => {
    expect(isValidVehicleNumber('MH12AB1234')).toBe(true);
    expect(isValidVehicleNumber('ABCD')).toBe(true);
    expect(isValidVehicleNumber('AB')).toBe(false);
    expect(isValidVehicleNumber('TOOLONG12345678')).toBe(false);
    expect(isValidVehicleNumber('mh12ab1234')).toBe(false); // expects uppercase
  });
});
