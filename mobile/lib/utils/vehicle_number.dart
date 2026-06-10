/// Mirror of backend src/utils/vehicleNumber.js
class VehicleNumber {
  static final _strip = RegExp(r'[\s\-\._]');
  static final _valid = RegExp(r'^[A-Z0-9]{4,12}$');

  static String normalize(String? input) {
    if (input == null) return '';
    return input.replaceAll(_strip, '').toUpperCase();
  }

  static bool isValid(String normalized) => _valid.hasMatch(normalized);
}
