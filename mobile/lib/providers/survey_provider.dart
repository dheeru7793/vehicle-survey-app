import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';

import '../models/survey.dart';
import '../models/survey_photo.dart';
import '../repositories/survey_repository.dart';
import '../services/draft_service.dart';
import '../services/image_service.dart';
import '../services/sync_service.dart';
import '../utils/vehicle_number.dart';

/// Owns the survey currently being edited and pushes changes to the draft
/// service (debounced).  Photos are compressed via [ImageService] before being
/// stored on the local model.
class SurveyProvider extends ChangeNotifier {
  final DraftService draftService;
  final SurveyRepository repo;
  final ImageService imageService;
  final SyncService syncService;

  Survey? _current;

  SurveyProvider({
    required this.draftService,
    required this.repo,
    required this.imageService,
    required this.syncService,
  });

  Survey? get current => _current;

  void startBlank() {
    _current = draftService.createBlank();
    draftService.debouncedSave(_current!);
    notifyListeners();
  }

  void resume(Survey s) {
    _current = s;
    notifyListeners();
  }

  void setVehicleNumber(String raw) {
    if (_current == null) return;
    _current!.vehicleNumber = VehicleNumber.normalize(raw);
    draftService.debouncedSave(_current!);
    notifyListeners();
  }

  void setNotes(String value) {
    if (_current == null) return;
    _current!.notes = value;
    draftService.debouncedSave(_current!);
    notifyListeners();
  }

  void setLocation(double? lat, double? lng) {
    if (_current == null) return;
    _current!.latitude = lat;
    _current!.longitude = lng;
    draftService.debouncedSave(_current!);
    notifyListeners();
  }

  Future<void> addPhotos(List<File> files) async {
    if (_current == null) return;
    int nextSeq = _current!.photos.isEmpty
        ? 1
        : _current!.photos.map((p) => p.sequenceNo).reduce((a, b) => a > b ? a : b) + 1;
    for (final file in files) {
      final compressed = await imageService.compressForUpload(file, sequenceNo: nextSeq);
      final size = await compressed.length();
      _current!.photos.add(
        SurveyPhoto(
          localPath: compressed.path,
          sequenceNo: nextSeq,
          sizeBytes: size,
        ),
      );
      nextSeq += 1;
    }
    draftService.debouncedSave(_current!);
    notifyListeners();
  }

  void removePhotoAt(int index) {
    if (_current == null) return;
    if (index < 0 || index >= _current!.photos.length) return;
    _current!.photos.removeAt(index);
    // Re-number sequence
    for (var i = 0; i < _current!.photos.length; i++) {
      _current!.photos[i].sequenceNo = i + 1;
    }
    draftService.debouncedSave(_current!);
    notifyListeners();
  }

  void reorderPhotos(int oldIndex, int newIndex) {
    if (_current == null) return;
    final list = _current!.photos;
    if (newIndex > oldIndex) newIndex -= 1;
    final item = list.removeAt(oldIndex);
    list.insert(newIndex, item);
    for (var i = 0; i < list.length; i++) {
      list[i].sequenceNo = i + 1;
    }
    draftService.debouncedSave(_current!);
    notifyListeners();
  }

  Future<Map<String, dynamic>> duplicateCheck() async {
    if (_current == null) return {'duplicate': false};
    return repo.duplicateCheck(_current!.vehicleNumber);
  }

  Future<void> enqueueForSync() async {
    if (_current == null) return;
    // Move from drafts box -> surveys box
    await draftService.delete(_current!);
    await repo.enqueueForSync(_current!);
    // Trigger immediate sync attempt
    unawaited(syncService.syncAll());
    _current = null;
    notifyListeners();
  }

  Future<void> abandonDraft() async {
    if (_current == null) return;
    await draftService.delete(_current!);
    _current = null;
    notifyListeners();
  }
}
