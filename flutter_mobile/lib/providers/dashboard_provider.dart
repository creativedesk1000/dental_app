import 'package:flutter/foundation.dart';
import '../models/dashboard.dart';
import '../services/dashboard_service.dart';

class DashboardProvider extends ChangeNotifier {
  final DashboardService _service = DashboardService();

  DashboardStats? _stats;
  bool _isLoading = false;
  String? _error;

  DashboardStats? get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load dashboard statistics
  Future<void> loadStats() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.getStats();
      if (response.success) {
        _stats = _service.parseStats(response.data);
      } else {
        _error = response.message ?? 'Failed to load dashboard';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Refresh dashboard data
  Future<void> refresh() async {
    await loadStats();
  }
}
