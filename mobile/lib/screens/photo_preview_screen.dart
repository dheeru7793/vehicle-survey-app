import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/survey_provider.dart';

class PhotoPreviewScreen extends StatelessWidget {
  const PhotoPreviewScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final s = context.watch<SurveyProvider>().current;
    return Scaffold(
      appBar: AppBar(title: Text('Photos (${s?.photos.length ?? 0})')),
      body: s == null
          ? const Center(child: Text('No survey in progress'))
          : ReorderableListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: s.photos.length,
              onReorder: (oldIdx, newIdx) =>
                  context.read<SurveyProvider>().reorderPhotos(oldIdx, newIdx),
              itemBuilder: (_, i) {
                final photo = s.photos[i];
                return Card(
                  key: ValueKey(photo.localPath),
                  child: ListTile(
                    leading: SizedBox(
                      width: 64,
                      height: 64,
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: Image.file(File(photo.localPath), fit: BoxFit.cover),
                      ),
                    ),
                    title: Text('Photo #${photo.sequenceNo}'),
                    subtitle: Text('${(photo.sizeBytes / 1024).toStringAsFixed(0)} KB'),
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.delete_outline),
                          onPressed: () => context.read<SurveyProvider>().removePhotoAt(i),
                        ),
                        const Icon(Icons.drag_handle),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
