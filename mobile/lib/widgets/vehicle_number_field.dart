import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../utils/vehicle_number.dart';

class _NormalizeFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(TextEditingValue _, TextEditingValue next) {
    final normalized = VehicleNumber.normalize(next.text);
    return TextEditingValue(
      text: normalized,
      selection: TextSelection.collapsed(offset: normalized.length),
    );
  }
}

class VehicleNumberField extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const VehicleNumberField({
    super.key,
    required this.controller,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      textCapitalization: TextCapitalization.characters,
      inputFormatters: [_NormalizeFormatter()],
      decoration: const InputDecoration(
        labelText: 'Vehicle Number',
        hintText: 'e.g. MH12AB1234',
        helperText: 'Spaces, dashes and dots are removed automatically.',
      ),
      onChanged: onChanged,
    );
  }
}
