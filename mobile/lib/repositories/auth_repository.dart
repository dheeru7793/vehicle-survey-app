import '../models/user.dart';
import '../services/api_service.dart';
import '../services/secure_storage_service.dart';

class AuthRepository {
  final ApiService api;
  final SecureStorageService storage;

  AuthRepository(this.api, this.storage);

  Future<AppUser> login({required String employeeId, required String password}) async {
    final res = await api.dio.post('/auth/login', data: {
      'employeeId': employeeId,
      'password': password,
    });
    final token = res.data['token'] as String;
    final user = AppUser.fromJson(res.data['user'] as Map<String, dynamic>);
    await storage.saveToken(token);
    await storage.saveUser(user);
    return user;
  }

  Future<AppUser?> currentUser() => storage.readUser();

  Future<void> logout() async {
    try {
      await api.dio.post('/auth/logout');
    } catch (_) {
      // ignore — best-effort audit
    }
    await storage.clearAll();
  }
}
