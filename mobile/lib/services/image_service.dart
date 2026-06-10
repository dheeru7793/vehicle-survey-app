import 'dart:io';

import 'package:flutter_image_compress/flutter_image_compress.dart';
import 'package:path_provider/path_provider.dart';

import '../core/constants.dart';

class ImageService {
  Future<File> compressForUpload(File source, {int? sequenceNo}) async {
    final tempDir = await getTemporaryDirectory();
    final ext = source.path.split('.').last.toLowerCase();
    final outPath =
        '${tempDir.path}/${DateTime.now().microsecondsSinceEpoch}_${sequenceNo ?? 0}.jpg';

    final result = await FlutterImageCompress.compressAndGetFile(
      source.absolute.path,
      outPath,
      format: CompressFormat.jpeg,
      quality: AppConfig.targetPhotoQuality,
      minWidth: AppConfig.targetPhotoMaxWidth,
      minHeight: 0,
      keepExif: false,
    );

    if (result == null) {
      // Fall back to original.
      return source;
    }
    final compressedFile = File(result.path);
    // If for some reason compression produced a *larger* file (rare on already-tiny inputs),
    // prefer the original.
    if (await compressedFile.length() >= await source.length()) {
      try {
        await compressedFile.delete();
      } catch (_) {}
      return source;
    }
    // We accept jpeg/jpg/png inputs. Compressed output is always JPEG.
    if (!{'jpg', 'jpeg', 'png'}.contains(ext)) {
      // Unsupported types are rejected earlier; defensive.
      return source;
    }
    return compressedFile;
  }
}
