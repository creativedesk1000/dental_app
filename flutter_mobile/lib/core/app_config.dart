import 'package:flutter/foundation.dart';

class AppConfig {
  static const String appName = 'Dental Care';
  static const String appVersion = '1.0.0';

  // Base URL resolution according to target platform
  static String get baseUrl {
    const envUrl = String.fromEnvironment('API_BASE_URL');
    if (envUrl.isNotEmpty) {
      return envUrl;
    }
    if (kIsWeb) {
      return 'http://localhost:3000';
    }
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:3000';
    }
    return 'http://localhost:3000';
  }

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 15);
  static const Duration sendTimeout = Duration(seconds: 15);

  // Storage keys
  static const String sessionTokenKey = 'authjs.session-token';
  static const String rememberMeKey = 'remember_me';
  static const String userDataKey = 'user_data';

  // Pagination
  static const int defaultPageSize = 20;
}
