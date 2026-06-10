import 'package:flutter/material.dart';

import '../models/survey.dart';

class SurveyStatusChip extends StatelessWidget {
  final String status;
  const SurveyStatusChip(this.status, {super.key});

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      SurveyStatus.draft => Colors.grey,
      SurveyStatus.pending => Colors.orange,
      SurveyStatus.uploading => Colors.blue,
      SurveyStatus.synced => Colors.green,
      SurveyStatus.failed => Colors.red,
      _ => Colors.black54,
    };
    return Chip(
      label: Text(status, style: const TextStyle(color: Colors.white, fontSize: 12)),
      backgroundColor: color,
      visualDensity: VisualDensity.compact,
      padding: const EdgeInsets.symmetric(horizontal: 4),
    );
  }
}
