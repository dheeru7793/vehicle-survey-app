// GENERATED-LIKE: hand-written so the project compiles without running build_runner.
// If you change the field set on Survey, re-run `flutter pub run build_runner build`
// after switching `Survey` and `SurveyPhoto` to `@HiveType(adapterName: ...)`.
// (Kept hand-written to keep V1 zero-codegen.)

part of 'survey.dart';

class SurveyAdapter extends TypeAdapter<Survey> {
  @override
  final int typeId = 0;

  @override
  Survey read(BinaryReader reader) {
    final fieldCount = reader.readByte();
    final fields = <int, dynamic>{
      for (var i = 0; i < fieldCount; i++) reader.readByte(): reader.read(),
    };
    return Survey(
      clientId: fields[0] as String,
      vehicleNumber: fields[1] as String,
      notes: fields[2] as String,
      latitude: fields[3] as double?,
      longitude: fields[4] as double?,
      status: fields[5] as String,
      photos: (fields[6] as List).cast<SurveyPhoto>(),
      createdAt: fields[7] as DateTime,
      updatedAt: fields[8] as DateTime,
      remoteId: fields[9] as String?,
      uploadedPhotoCount: (fields[10] as int?) ?? 0,
      lastError: fields[11] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, Survey obj) {
    writer
      ..writeByte(12)
      ..writeByte(0)..write(obj.clientId)
      ..writeByte(1)..write(obj.vehicleNumber)
      ..writeByte(2)..write(obj.notes)
      ..writeByte(3)..write(obj.latitude)
      ..writeByte(4)..write(obj.longitude)
      ..writeByte(5)..write(obj.status)
      ..writeByte(6)..write(obj.photos)
      ..writeByte(7)..write(obj.createdAt)
      ..writeByte(8)..write(obj.updatedAt)
      ..writeByte(9)..write(obj.remoteId)
      ..writeByte(10)..write(obj.uploadedPhotoCount)
      ..writeByte(11)..write(obj.lastError);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is SurveyAdapter && other.typeId == typeId;
}
