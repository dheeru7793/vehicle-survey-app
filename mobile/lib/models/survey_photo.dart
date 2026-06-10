import 'package:hive/hive.dart';

part 'survey_photo.g.dart';

@HiveType(typeId: 1)
class SurveyPhoto extends HiveObject {
  @HiveField(0)
  String localPath;

  @HiveField(1)
  int sequenceNo;

  @HiveField(2)
  bool uploaded;

  @HiveField(3)
  String? remoteId;

  @HiveField(4)
  String? remoteUrl;

  @HiveField(5)
  String? remoteThumbUrl;

  @HiveField(6)
  int sizeBytes;

  SurveyPhoto({
    required this.localPath,
    required this.sequenceNo,
    this.uploaded = false,
    this.remoteId,
    this.remoteUrl,
    this.remoteThumbUrl,
    this.sizeBytes = 0,
  });
}
