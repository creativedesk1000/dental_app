import '../core/api_client.dart';
import '../models/auth.dart';
import '../models/user.dart';

class AuthService {
  final ApiClient _client = ApiClient();

  /// Login with email and password
  Future<ApiResponse<dynamic>> login(LoginRequest request) async {
    return _client.post('/api/auth/login', data: request.toJson());
  }

  /// Register a new clinic
  Future<ApiResponse<dynamic>> register(
    RegisterClinicRequest request,
  ) async {
    return _client.post('/api/auth/register', data: request.toJson());
  }

  /// Forgot password - sends reset email
  Future<ApiResponse<dynamic>> forgotPassword(
    ForgotPasswordRequest request,
  ) async {
    return _client.post('/api/auth/forgot-password', data: request.toJson());
  }

  /// Reset password with token
  Future<ApiResponse<dynamic>> resetPassword(
    ResetPasswordRequest request,
  ) async {
    return _client.post('/api/auth/reset-password', data: request.toJson());
  }

  /// Change password (requires auth)
  Future<ApiResponse<dynamic>> changePassword(
    ChangePasswordRequest request,
  ) async {
    return _client.post('/api/auth/change-password', data: request.toJson());
  }

  /// Logout
  Future<ApiResponse<dynamic>> logout() async {
    return _client.post('/api/auth/logout');
  }

  /// Get current user profile
  Future<ApiResponse<dynamic>> getProfile() async {
    return _client.get('/api/me');
  }

  /// Verify email with token
  Future<ApiResponse<dynamic>> verifyEmail(
    String email,
    String token,
  ) async {
    return _client.post(
      '/api/auth/verify-email',
      data: {'email': email, 'token': token},
    );
  }

  /// Resend verification email
  Future<ApiResponse<dynamic>> resendVerification(
    String email,
  ) async {
    return _client.post(
      '/api/auth/resend-verification',
      data: {'email': email},
    );
  }

  /// Parse user from profile response
  User? parseUser(dynamic data) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      if (data.containsKey('user') && data['user'] is Map<String, dynamic>) {
        return User.fromJson(data['user'] as Map<String, dynamic>);
      }
      if (data.containsKey('data') && data['data'] is Map<String, dynamic>) {
        return User.fromJson(data['data'] as Map<String, dynamic>);
      }
      return User.fromJson(data);
    }
    return null;
  }
}
