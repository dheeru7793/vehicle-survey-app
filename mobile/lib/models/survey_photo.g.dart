// GENERATED-LIKE: see survey.g.dart for rationale.

part of 'survey_photo.dart';

class SurveyPhotoAdapter extends TypeAdapter<SurveyPhoto> {
  @override
  final int typeId = 1;

  @override
  SurveyPhoto read(BinaryReader reader) {
    final fieldCount = reader.readByte();
    final fields = <int, dynamic>{
      for (var i = 0; i < fieldCount; i++) reader.readByte(): reader.read(),
    };
    return SurveyPhoto(
      localPath: fields[0] as String,
      sequenceNo: fields[1] as int,
      uploaded: (fields[2] as bool?) ?? false,
      remoteId: fields[3] as String?,
      remoteUrl: fields[4] as String?,
      remoteThumbUrl: fields[5] as String?,
      sizeBytes: (fields[6] as int?) ?? 0,
    );
  }

  @override
  void write(BinaryWriter writer, SurveyPhoto obj) {
    writer
      ..writeByte(7)
      ..writeByte(0)..write(obj.localPath)
      ..writeByte(1)..write(obj.sequenceNo)
      ..writeByte(2)..write(obj.uploaded)
      ..writeByte(3)..write(obj.remoteId)
      ..writeByte(4)..write(obj.remoteUrl)
      ..writeByte(5)..write(obj.remoteThumbUrl)
      ..writeByte(6)..write(obj.sizeBytes);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is SurveyPhotoAdapter && other.typeId == typeId;
}
