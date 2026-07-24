import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'app_config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final Map<String, dynamic>? errors;

  ApiException({required this.message, this.statusCode, this.errors});

  @override
  String toString() => 'ApiException: $message (status: $statusCode)';
}

class ApiResponse<T> {
  final bool success;
  final T? data;
  final String? message;
  final Map<String, dynamic>? errors;

  ApiResponse({required this.success, this.data, this.message, this.errors});
}

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio _dio;

  ApiClient._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.baseUrl,
        connectTimeout: AppConfig.connectTimeout,
        receiveTimeout: AppConfig.receiveTimeout,
        sendTimeout: AppConfig.sendTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // For cookie-based auth, we need to include credentials
        extra: {'withCredentials': true},
      ),
    );

    // Add cookie interceptor for cookie-based auth
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (kDebugMode) {
            debugPrint('🌐 API Request: ${options.method} ${options.path}');
            debugPrint('Headers: ${options.headers}');
            if (options.data != null) {
              debugPrint('Body: ${options.data}');
            }
          }
          handler.next(options);
        },
        onResponse: (response, handler) {
          if (kDebugMode) {
            debugPrint(
              '✅ API Response: ${response.statusCode} ${response.requestOptions.path}',
            );
          }
          handler.next(response);
        },
        onError: (error, handler) {
          if (kDebugMode) {
            debugPrint(
              '❌ API Error: ${error.response?.statusCode} ${error.requestOptions.path}',
            );
            debugPrint('Error: ${error.message}');
          }
          handler.next(error);
        },
      ),
    );
  }

  /// Update the base URL at runtime (useful for switching environments)
  void updateBaseUrl(String url) {
    _dio.options.baseUrl = url;
  }

  /// Generic GET request
  Future<ApiResponse<dynamic>> get(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters);
      return _processResponse(response);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// Generic POST request
  Future<ApiResponse<dynamic>> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _processResponse(response);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// Generic PATCH request
  Future<ApiResponse<dynamic>> patch(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.patch(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _processResponse(response);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// Generic PUT request
  Future<ApiResponse<dynamic>> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
      );
      return _processResponse(response);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  /// Generic DELETE request
  Future<ApiResponse<dynamic>> delete(
    String path, {
    Map<String, dynamic>? queryParameters,
  }) async {
    try {
      final response = await _dio.delete(
        path,
        queryParameters: queryParameters,
      );
      return _processResponse(response);
    } on DioException catch (e) {
      return _handleDioError(e);
    }
  }

  ApiResponse<dynamic> _processResponse(Response response) {
    final body = response.data as Map<String, dynamic>?;

    if (body == null) {
      return ApiResponse(success: false, message: 'Empty response from server');
    }

    final success = body['success'] as bool? ?? false;
    final data = body['data'];
    final message = body['message'] as String?;
    final errors = body['errors'] as Map<String, dynamic>?;

    return ApiResponse(
      success: success,
      data: data,
      message: message,
      errors: errors,
    );
  }

  ApiResponse<dynamic> _handleDioError(DioException error) {
    if (error.response?.data is Map) {
      final body = error.response!.data as Map<String, dynamic>;
      return ApiResponse(
        success: false,
        message: body['message'] as String? ?? 'An error occurred',
        errors: body['errors'] as Map<String, dynamic>?,
      );
    }

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return ApiResponse(
          success: false,
          message:
              'Connection timed out. Please check your internet connection.',
        );
      case DioExceptionType.connectionError:
        return ApiResponse(
          success: false,
          message: 'Unable to connect to server. Please try again later.',
        );
      case DioExceptionType.badResponse:
        return ApiResponse(
          success: false,
          message:
              'Server error (${error.response?.statusCode}). Please try again.',
        );
      default:
        return ApiResponse(
          success: false,
          message: 'An unexpected error occurred.',
        );
    }
  }
}

/// Helper extension to parse list data from API responses
extension ApiResponseListX on ApiResponse<dynamic> {
  List<T> parseList<T>(T Function(Map<String, dynamic>) fromJson) {
    if (data == null) return [];
    if (data is List) {
      return (data as List)
          .map((e) => fromJson(e as Map<String, dynamic>))
          .toList();
    }
    if (data is Map<String, dynamic>) {
      final map = data as Map<String, dynamic>;
      final list = (map['data'] ?? map['items']) as List<dynamic>?;
      if (list != null) {
        return list.map((e) => fromJson(e as Map<String, dynamic>)).toList();
      }
    }
    return [];
  }

  T? parseSingle<T>(T Function(Map<String, dynamic>) fromJson) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      final map = data as Map<String, dynamic>;
      if (map.containsKey('data') && map['data'] is Map<String, dynamic>) {
        return fromJson(map['data'] as Map<String, dynamic>);
      }
      return fromJson(map);
    }
    return null;
  }
}
