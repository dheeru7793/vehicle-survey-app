import 'package:flutter_test/flutter_test.dart';
import 'package:vehicle_survey/utils/vehicle_number.dart';

void main() {
  group('VehicleNumber.normalize', () {
    test('strips spaces, dashes, dots and uppercases', () {
      expect(VehicleNumber.normalize('mh12-ab 1234'), 'MH12AB1234');
      expect(VehicleNumber.normalize('  MH 14 XY 5678  '), 'MH14XY5678');
      expect(VehicleNumber.normalize('mh.12.ab.1234'), 'MH12AB1234');
      expect(VehicleNumber.normalize(null), '');
    });

    test('isValid checks regex', () {
      expect(VehicleNumber.isValid('MH12AB1234'), isTrue);
      expect(VehicleNumber.isValid('ABCD'), isTrue);
      expect(VehicleNumber.isValid('AB'), isFalse);
      expect(VehicleNumber.isValid('TOOLONG12345678'), isFalse);
    });
  });
}
