import '../core/api_client.dart';
import '../models/dashboard.dart';

class DashboardService {
  final ApiClient _client = ApiClient();

  /// Get dashboard statistics
  Future<ApiResponse<dynamic>> getStats() async {
    return _client.get('/api/dashboard/stats');
  }

  /// Parse dashboard stats from response
  DashboardStats? parseStats(dynamic data) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      if (data.containsKey('data') && data['data'] is Map<String, dynamic>) {
        return DashboardStats.fromJson(data['data'] as Map<String, dynamic>);
      }
      return DashboardStats.fromJson(data);
    }
    return null;
  }
}
