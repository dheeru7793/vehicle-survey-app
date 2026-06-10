import 'package:flutter/foundation.dart';

import '../models/survey.dart';
import '../services/sync_service.dart';

class SyncProvider extends ChangeNotifier {
  final SyncService service;

  SyncProvider(this.service) {
    service.onChanged = notifyListeners;
    service.onProgress = (_, __, ___) => notifyListeners();
  }

  int get pendingCount => service.pendingCount();

  void kick() => service.syncAll();

  String progressText(Survey s) =>
      '${s.uploadedPhotoCount} of ${s.totalPhotos} photos uploaded';
}
