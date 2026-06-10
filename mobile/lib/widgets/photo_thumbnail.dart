import 'dart:io';

import 'package:flutter/material.dart';

import '../models/survey_photo.dart';

class PhotoThumbnail extends StatelessWidget {
  final SurveyPhoto photo;
  final VoidCallback? onDelete;

  const PhotoThumbnail({super.key, required this.photo, this.onDelete});

  @override
  Widget build(BuildContext context) {
    final file = File(photo.localPath);
    return Stack(
      fit: StackFit.expand,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(8),
          child: file.existsSync()
              ? Image.file(file, fit: BoxFit.cover)
              : Container(color: Colors.black12, child: const Icon(Icons.broken_image)),
        ),
        Positioned(
          left: 4,
          bottom: 4,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.black54,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              '#${photo.sequenceNo}',
              style: const TextStyle(color: Colors.white, fontSize: 10),
            ),
          ),
        ),
        if (onDelete != null)
          Positioned(
            right: 0,
            top: 0,
            child: IconButton(
              icon: const Icon(Icons.cancel, color: Colors.white),
              onPressed: onDelete,
              padding: EdgeInsets.zero,
              constraints: const BoxConstraints(),
            ),
          ),
        if (photo.uploaded)
          const Positioned(
            right: 4,
            bottom: 4,
            child: Icon(Icons.cloud_done, size: 16, color: Colors.greenAccent),
          ),
      ],
    );
  }
}
