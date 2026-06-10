import 'dart:async';

import 'package:hive/hive.dart';
import 'package:uuid/uuid.dart';

import '../core/constants.dart';
import '../models/survey.dart';

/// Wraps the Hive `drafts` box and provides a debounced auto-save API.
class DraftService {
  static const _uuid = Uuid();

  Box<Survey> get _box => Hive.box<Survey>(AppConfig.hiveBoxDraft);

  Timer? _debounce;

  Survey createBlank() {
    final now = DateTime.now();
    return Survey(
      clientId: _uuid.v4(),
      vehicleNumber: '',
      notes: '',
      latitude: null,
      longitude: null,
      status: SurveyStatus.draft,
      photos: [],
      createdAt: now,
      updatedAt: now,
    );
  }

  Future<void> save(Survey s) async {
    s.updatedAt = DateTime.now();
    await _box.put(s.clientId, s);
  }

  /// Debounced save: collapses bursts of edits into a single write.
  void debouncedSave(Survey s) {
    _debounce?.cancel();
    _debounce = Timer(
      const Duration(milliseconds: AppConfig.draftAutoSaveDebounceMs),
      () => save(s),
    );
  }

  Future<void> delete(Survey s) async {
    _debounce?.cancel();
    await _box.delete(s.clientId);
  }

  List<Survey> listAll() => _box.values.toList()
    ..sort((a, b) => b.updatedAt.compareTo(a.updatedAt));

  List<Survey> listOpenDrafts() =>
      listAll().where((s) => s.status == SurveyStatus.draft).toList();

  Survey? findRecoverable() {
    // An "unfinished survey" is a draft (still being edited) with at least one
    // field filled in.
    for (final s in listAll()) {
      if (s.status != SurveyStatus.draft) continue;
      if (s.vehicleNumber.trim().isNotEmpty ||
          s.notes.trim().isNotEmpty ||
          s.photos.isNotEmpty) {
        return s;
      }
    }
    return null;
  }
}
