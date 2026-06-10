import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../core/constants.dart';
import '../models/user.dart';

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );

  Future<void> saveToken(String token) =>
      _storage.write(key: AppConfig.secureTokenKey, value: token);

  Future<String?> readToken() => _storage.read(key: AppConfig.secureTokenKey);

  Future<void> deleteToken() => _storage.delete(key: AppConfig.secureTokenKey);

  Future<void> saveUser(AppUser user) =>
      _storage.write(key: AppConfig.secureUserKey, value: jsonEncode(user.toJson()));

  Future<AppUser?> readUser() async {
    final raw = await _storage.read(key: AppConfig.secureUserKey);
    if (raw == null || raw.isEmpty) return null;
    return AppUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
  }

  Future<void> clearAll() async {
    await _storage.delete(key: AppConfig.secureTokenKey);
    await _storage.delete(key: AppConfig.secureUserKey);
  }
}
