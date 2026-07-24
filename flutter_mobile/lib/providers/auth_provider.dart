import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/app_config.dart';
import '../models/auth.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

enum AuthStatus { uninitialized, authenticated, unauthenticated, loading }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus _status = AuthStatus.uninitialized;
  User? _user;
  String? _error;
  bool _isLoading = false;

  AuthStatus get status => _status;
  User? get user => _user;
  String? get error => _error;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isDoctor => _user?.isDoctor ?? false;
  bool get isReceptionist => _user?.isReceptionist ?? false;
  bool get isClinicAdmin => _user?.isClinicAdmin ?? false;

  /// Initialize auth state - check for stored session
  Future<void> initialize() async {
    _status = AuthStatus.loading;
    notifyListeners();

    try {
      // Try to get the current user session by calling /api/me
      final response = await _authService.getProfile();
      if (response.success) {
        _user = _authService.parseUser(response.data);
        _status = AuthStatus.authenticated;
      } else {
        _status = AuthStatus.unauthenticated;
      }
    } catch (e) {
      _status = AuthStatus.unauthenticated;
    }

    notifyListeners();
  }

  /// Login with email and password
  Future<bool> login({
    required String email,
    required String password,
    bool rememberMe = false,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.login(
        LoginRequest(email: email, password: password, rememberMe: rememberMe),
      );

      if (response.success) {
        // Fetch full user profile
        final profileResponse = await _authService.getProfile();
        if (profileResponse.success) {
          _user = _authService.parseUser(profileResponse.data);
          _status = AuthStatus.authenticated;

          // Store remember me preference
          final prefs = await SharedPreferences.getInstance();
          await prefs.setBool(AppConfig.rememberMeKey, rememberMe);
          if (rememberMe) {
            await prefs.setString(AppConfig.userDataKey, _user!.email ?? '');
          } else {
            await prefs.remove(AppConfig.userDataKey);
          }

          _isLoading = false;
          notifyListeners();
          return true;
        }
      }

      _error = response.message ?? 'Login failed';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Register a new clinic
  Future<bool> register(RegisterClinicRequest request) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.register(request);

      if (response.success) {
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _error = response.message ?? 'Registration failed';
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Logout
  Future<void> logout() async {
    _isLoading = true;
    notifyListeners();

    try {
      await _authService.logout();
    } catch (_) {
      // Logout even if API call fails
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConfig.rememberMeKey);

    _user = null;
    _status = AuthStatus.unauthenticated;
    _error = null;
    _isLoading = false;
    notifyListeners();
  }

  /// Forgot password
  Future<bool> forgotPassword(String email) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.forgotPassword(
        ForgotPasswordRequest(email: email),
      );

      if (response.success) {
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _error = response.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Reset password
  Future<bool> resetPassword(
    String email,
    String token,
    String password,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.resetPassword(
        ResetPasswordRequest(email: email, token: token, password: password),
      );

      if (response.success) {
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _error = response.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Change password
  Future<bool> changePassword(
    String currentPassword,
    String newPassword,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _authService.changePassword(
        ChangePasswordRequest(
          currentPassword: currentPassword,
          newPassword: newPassword,
        ),
      );

      if (response.success) {
        _isLoading = false;
        notifyListeners();
        return true;
      }

      _error = response.message;
      _isLoading = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  /// Clear error
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
