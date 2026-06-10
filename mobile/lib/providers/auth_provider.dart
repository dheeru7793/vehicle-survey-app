import 'package:flutter/foundation.dart';

import '../models/user.dart';
import '../repositories/auth_repository.dart';

class AuthProvider extends ChangeNotifier {
  final AuthRepository repo;
  AppUser? _user;
  bool _busy = false;
  String? _error;

  AuthProvider(this.repo);

  AppUser? get user => _user;
  bool get isLoggedIn => _user != null;
  bool get busy => _busy;
  String? get error => _error;

  Future<void> bootstrap() async {
    _user = await repo.currentUser();
    notifyListeners();
  }

  Future<bool> login(String employeeId, String password) async {
    _busy = true;
    _error = null;
    notifyListeners();
    try {
      _user = await repo.login(employeeId: employeeId, password: password);
      return true;
    } catch (e) {
      _error = _humanError(e);
      return false;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }

  Future<void> logout() async {
    await repo.logout();
    _user = null;
    notifyListeners();
  }

  void forceLogoutFrom401() {
    _user = null;
    notifyListeners();
  }

  static String _humanError(Object e) {
    final s = e.toString();
    if (s.contains('401')) return 'Invalid Employee ID or password.';
    if (s.contains('403')) return 'Account is deactivated.';
    if (s.contains('429')) return 'Too many attempts. Try again in a few minutes.';
    if (s.contains('SocketException') || s.contains('Network')) return 'No internet connection.';
    return 'Login failed. Please try again.';
  }
}
