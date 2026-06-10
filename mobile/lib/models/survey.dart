import 'package:hive/hive.dart';

import 'survey_photo.dart';

part 'survey.g.dart';

class SurveyStatus {
  static const draft = 'DRAFT';
  static const pending = 'PENDING';
  static const uploading = 'UPLOADING';
  static const synced = 'SYNCED';
  static const failed = 'FAILED';
}

@HiveType(typeId: 0)
class Survey extends HiveObject {
  @HiveField(0)
  String clientId; // UUID v4

  @HiveField(1)
  String vehicleNumber;

  @HiveField(2)
  String notes;

  @HiveField(3)
  double? latitude;

  @HiveField(4)
  double? longitude;

  @HiveField(5)
  String status; // DRAFT | PENDING | UPLOADING | SYNCED | FAILED

  @HiveField(6)
  List<SurveyPhoto> photos;

  @HiveField(7)
  DateTime createdAt;

  @HiveField(8)
  DateTime updatedAt;

  @HiveField(9)
  String? remoteId; // server _id once synced

  @HiveField(10)
  int uploadedPhotoCount;

  @HiveField(11)
  String? lastError;

  Survey({
    required this.clientId,
    required this.vehicleNumber,
    required this.notes,
    required this.latitude,
    required this.longitude,
    required this.status,
    required this.photos,
    required this.createdAt,
    required this.updatedAt,
    this.remoteId,
    this.uploadedPhotoCount = 0,
    this.lastError,
  });

  int get totalPhotos => photos.length;

  double get uploadProgress {
    if (photos.isEmpty) return 0;
    return uploadedPhotoCount / photos.length;
  }
}
