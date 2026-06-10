import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../core/routes.dart';
import '../providers/survey_provider.dart';
import '../providers/sync_provider.dart';
import '../services/draft_service.dart';
import '../widgets/survey_status_chip.dart';
import '../widgets/upload_progress_bar.dart';
import '../repositories/survey_repository.dart';

class DraftsScreen extends StatelessWidget {
  const DraftsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final draftService = context.read<DraftService>();
    final repo = context.read<SurveyRepository>();
    final sync = context.watch<SyncProvider>();

    final drafts = draftService.listOpenDrafts();
    final inFlight = repo.localAll().where((s) =>
        s.status != 'SYNCED').toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Drafts & Pending'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sync),
            tooltip: 'Sync now',
            onPressed: sync.pendingCount == 0 ? null : sync.kick,
          ),
        ],
      ),
      body: drafts.isEmpty && inFlight.isEmpty
          ? const Center(child: Text('No drafts or pending surveys.'))
          : ListView(
              padding: const EdgeInsets.all(12),
              children: [
                if (drafts.isNotEmpty)
                  Text('Open drafts', style: Theme.of(context).textTheme.titleMedium),
                ...drafts.map((s) => Card(
                      child: ListTile(
                        leading: const Icon(Icons.edit),
                        title: Text(s.vehicleNumber.isEmpty ? '(no vehicle number)' : s.vehicleNumber),
                        subtitle: Text(
                            '${s.photos.length} photos · last edit ${DateFormat('d MMM HH:mm').format(s.updatedAt)}'),
                        trailing: const SurveyStatusChip('DRAFT'),
                        onTap: () {
                          context.read<SurveyProvider>().resume(s);
                          Navigator.of(context).pushNamed(AppRoutes.newSurvey);
                        },
                      ),
                    )),
                if (inFlight.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Pending uploads', style: Theme.of(context).textTheme.titleMedium),
                  ...inFlight.map((s) => Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              Row(
                                children: [
                                  Expanded(child: Text(s.vehicleNumber)),
                                  SurveyStatusChip(s.status),
                                ],
                              ),
                              const SizedBox(height: 8),
                              UploadProgressBar(survey: s),
                              if (s.lastError != null) ...[
                                const SizedBox(height: 6),
                                Text(s.lastError!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                              ],
                            ],
                          ),
                        ),
                      )),
                ],
              ],
            ),
    );
  }
}
