import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../repositories/survey_repository.dart';

class SurveyDetailScreen extends StatefulWidget {
  const SurveyDetailScreen({super.key});

  @override
  State<SurveyDetailScreen> createState() => _SurveyDetailScreenState();
}

class _SurveyDetailScreenState extends State<SurveyDetailScreen> {
  Future<List<Map<String, dynamic>>>? _photos;
  Map<String, dynamic>? _survey;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_survey == null) {
      final s = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
      _survey = s;
      _photos = context.read<SurveyRepository>().remotePhotos(s['_id'].toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    final s = _survey!;
    final created = DateTime.tryParse((s['createdAt'] ?? '').toString());
    return Scaffold(
      appBar: AppBar(title: Text(s['vehicleNumber']?.toString() ?? 'Survey')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _row('Vehicle', s['vehicleNumber']?.toString() ?? ''),
          _row('Surveyor', s['surveyorName']?.toString() ?? ''),
          _row('Status', s['status']?.toString() ?? ''),
          _row('Created', created == null ? '—' : DateFormat('d MMM y HH:mm').format(created)),
          if ((s['notes'] ?? '').toString().isNotEmpty) _row('Notes', s['notes'].toString()),
          if (s['location'] != null)
            _row(
              'GPS',
              '${(s['location']['coordinates'][1]).toString()}, ${(s['location']['coordinates'][0]).toString()}',
            ),
          const SizedBox(height: 16),
          Text('Photos', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          FutureBuilder<List<Map<String, dynamic>>>(
            future: _photos,
            builder: (context, snap) {
              if (snap.connectionState == ConnectionState.waiting) {
                return const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              final items = snap.data ?? [];
              if (items.isEmpty) return const Text('No photos uploaded.');
              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  crossAxisSpacing: 6,
                  mainAxisSpacing: 6,
                ),
                itemCount: items.length,
                itemBuilder: (_, i) {
                  final p = items[i];
                  final thumb = (p['thumbUrl'] ?? p['url'] ?? '').toString();
                  final full = (p['url'] ?? '').toString();
                  return GestureDetector(
                    onTap: () => showDialog(
                      context: context,
                      builder: (_) => Dialog(
                        child: InteractiveViewer(
                          child: CachedNetworkImage(imageUrl: full, fit: BoxFit.contain),
                        ),
                      ),
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: CachedNetworkImage(
                        imageUrl: thumb,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(color: Colors.black12),
                        errorWidget: (_, __, ___) => const Icon(Icons.broken_image),
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 90, child: Text(label, style: const TextStyle(color: Colors.black54))),
            Expanded(child: Text(value)),
          ],
        ),
      );
}
