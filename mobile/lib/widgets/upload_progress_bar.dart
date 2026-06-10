import 'package:flutter/material.dart';

import '../models/survey.dart';

class UploadProgressBar extends StatelessWidget {
  final Survey survey;
  const UploadProgressBar({super.key, required this.survey});

  @override
  Widget build(BuildContext context) {
    final total = survey.totalPhotos;
    final sent = survey.uploadedPhotoCount;
    final pct = total == 0 ? 0 : ((sent / total) * 100).round();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        LinearProgressIndicator(value: total == 0 ? null : sent / total),
        const SizedBox(height: 4),
        Text('$sent of $total photos uploaded   $pct% completed',
            style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
