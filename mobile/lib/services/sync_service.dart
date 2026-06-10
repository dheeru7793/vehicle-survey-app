import 'dart:async';
import 'dart:io';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:dio/dio.dart';
import 'package:hive/hive.dart';

import '../core/constants.dart';
import '../models/survey.dart';
import 'api_service.dart';
import 'image_service.dart';

typedef OnSurveyProgress = void Function(Survey survey, int sent, int total);

class SyncService {
  final ApiService api;
  final ImageService imageService;

  bool _running = false;
  StreamSubscription? _connectivitySub;
  OnSurveyProgress? onProgress;
  void Function()? onChanged;

  SyncService(this.api, this.imageService);

  Box<Survey> get _surveys => Hive.box<Survey>(AppConfig.hiveBoxSurveys);

  /// Start listening to connectivity changes and run a sync pass whenever the
  /// device is online. Safe to call once at app start.
  void start() {
    _connectivitySub?.cancel();
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final online = results.any((r) => r != ConnectivityResult.none);
      if (online) syncAll();
    });
    syncAll();
  }

  Future<void> stop() async {
    await _connectivitySub?.cancel();
    _connectivitySub = null;
  }

  int pendingCount() => _surveys.values
      .where((s) =>
          s.status == SurveyStatus.pending ||
          s.status == SurveyStatus.uploading ||
          s.status == SurveyStatus.failed)
      .length;

  /// Walk every PENDING/FAILED survey and try to push it.
  Future<void> syncAll() async {
    if (_running) return;
    _running = true;
    try {
      final pending = _surveys.values
          .where((s) =>
              s.status == SurveyStatus.pending ||
              s.status == SurveyStatus.uploading ||
              s.status == SurveyStatus.failed)
          .toList();
      for (final survey in pending) {
        await _syncOne(survey);
      }
    } finally {
      _running = false;
      onChanged?.call();
    }
  }

  Future<void> _syncOne(Survey survey) async {
    try {
      survey.status = SurveyStatus.uploading;
      survey.lastError = null;
      await survey.save();
      onChanged?.call();

      // 1. Create / find on server (idempotent by clientId)
      if (survey.remoteId == null) {
        final res = await api.dio.post(
          '/surveys',
          data: {
            'vehicleNumber': survey.vehicleNumber,
            'notes': survey.notes,
            if (survey.latitude != null) 'latitude': survey.latitude,
            if (survey.longitude != null) 'longitude': survey.longitude,
            'status': 'UPLOADING',
            'clientId': survey.clientId,
          },
        );
        survey.remoteId = (res.data['survey']?['_id'] ?? '') as String;
        await survey.save();
      }

      // 2. Upload photos that haven't been uploaded yet.
      final toUpload = survey.photos.where((p) => !p.uploaded).toList();
      int sent = survey.photos.length - toUpload.length;
      onProgress?.call(survey, sent, survey.photos.length);

      for (final photo in toUpload) {
        final file = File(photo.localPath);
        if (!file.existsSync()) {
          // user deleted the original; mark uploaded so we move on.
          photo.uploaded = true;
          continue;
        }
        final form = FormData.fromMap({
          'photos': await MultipartFile.fromFile(file.path),
        });
        final res = await api.dio.post(
          '/surveys/${survey.remoteId}/photos',
          data: form,
          options: Options(contentType: 'multipart/form-data'),
          onSendProgress: (sentBytes, totalBytes) {
            // Per-file progress hook; left intentionally unused at the survey level
            // beyond surfacing photo-count progress (which is more useful for the UI).
          },
        );
        final returned = (res.data['photos'] as List).cast<Map<String, dynamic>>();
        if (returned.isNotEmpty) {
          final p0 = returned.first;
          photo.uploaded = true;
          photo.remoteId = (p0['_id'] ?? '').toString();
          photo.remoteUrl = (p0['url'] ?? '').toString();
          photo.remoteThumbUrl = (p0['thumbUrl'] ?? '').toString();
        }
        survey.uploadedPhotoCount = survey.photos.where((p) => p.uploaded).length;
        await survey.save();
        sent += 1;
        onProgress?.call(survey, sent, survey.photos.length);
      }

      // 3. Mark synced
      if (survey.remoteId != null) {
        await api.dio.patch('/surveys/${survey.remoteId}', data: {'status': 'SYNCED'});
      }
      survey.status = SurveyStatus.synced;
      await survey.save();
    } catch (e) {
      survey.status = SurveyStatus.failed;
      survey.lastError = e.toString();
      await survey.save();
    } finally {
      onChanged?.call();
    }
  }
}
