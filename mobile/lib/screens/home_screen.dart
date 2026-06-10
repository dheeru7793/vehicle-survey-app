import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../core/routes.dart';
import '../providers/auth_provider.dart';
import '../providers/survey_provider.dart';
import '../providers/sync_provider.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final sync = context.watch<SyncProvider>();
    final pending = sync.pendingCount;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vehicle Survey'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Logout',
            onPressed: () async {
              await context.read<AuthProvider>().logout();
              if (context.mounted) {
                Navigator.of(context).pushNamedAndRemoveUntil(
                    AppRoutes.login, (route) => false);
              }
            },
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Hello, ${auth.user?.name ?? '—'}',
                      style: Theme.of(context).textTheme.titleLarge),
                  const SizedBox(height: 4),
                  Text('Employee ID: ${auth.user?.employeeId ?? '—'}',
                      style: Theme.of(context).textTheme.bodyMedium),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      const Icon(Icons.cloud_sync, size: 16),
                      const SizedBox(width: 6),
                      Text('Pending sync: $pending'),
                      const Spacer(),
                      if (pending > 0)
                        TextButton(
                          onPressed: () => context.read<SyncProvider>().kick(),
                          child: const Text('Sync now'),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          _MenuTile(
            icon: Icons.add_a_photo,
            label: 'New Survey',
            onTap: () {
              context.read<SurveyProvider>().startBlank();
              Navigator.of(context).pushNamed(AppRoutes.newSurvey);
            },
          ),
          _MenuTile(
            icon: Icons.history,
            label: 'Survey History',
            onTap: () => Navigator.of(context).pushNamed(AppRoutes.history),
          ),
          _MenuTile(
            icon: Icons.drafts,
            label: 'Draft Surveys',
            onTap: () => Navigator.of(context).pushNamed(AppRoutes.drafts),
          ),
        ],
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _MenuTile({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(icon, size: 32),
        title: Text(label, style: Theme.of(context).textTheme.titleMedium),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
