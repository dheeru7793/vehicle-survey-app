import 'dart:async';

import 'package:dio/dio.dart';

import '../core/constants.dart';
import 'secure_storage_service.dart';

typedef UnauthorizedHandler = Future<void> Function();

class ApiService {
  late final Dio dio;
  final SecureStorageService _storage;
  UnauthorizedHandler? onUnauthorized;

  ApiService(this._storage) {
    dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 60),
        sendTimeout: const Duration(minutes: 5),
        headers: {'Accept': 'application/json'},
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.readToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (err, handler) async {
          if (err.response?.statusCode == 401) {
            await _storage.clearAll();
            if (onUnauthorized != null) {
              await onUnauthorized!();
            }
          }
          handler.next(err);
        },
      ),
    );
  }
}
