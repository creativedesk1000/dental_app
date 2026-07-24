import 'package:flutter/foundation.dart';
import '../models/appointment.dart';
import '../services/appointment_service.dart';

class AppointmentProvider extends ChangeNotifier {
  final AppointmentService _service = AppointmentService();

  List<Appointment> _appointments = [];
  Appointment? _selectedAppointment;
  bool _isLoading = false;
  String? _error;

  List<Appointment> get appointments => _appointments;
  Appointment? get selectedAppointment => _selectedAppointment;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load appointments list
  Future<void> loadAppointments({
    String? clinicId,
    String? doctorId,
    String? status,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.listAppointments(
        clinicId: clinicId,
        doctorId: doctorId,
        status: status,
      );
      if (response.success) {
        _appointments = _service.parseList(response.data);
      } else {
        _error = response.message ?? 'Failed to load appointments';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Get appointment by ID
  Future<void> loadAppointment(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.getAppointment(id);
      if (response.success) {
        _selectedAppointment = _service.parseSingle(response.data);
      } else {
        _error = response.message ?? 'Failed to load appointment';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Create a new appointment
  Future<bool> createAppointment(CreateAppointmentRequest request) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.createAppointment(request);
      if (response.success) {
        await loadAppointments();
        return true;
      }
      _error = response.message ?? 'Failed to create appointment';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Update an existing appointment
  Future<bool> updateAppointment(
    String id,
    UpdateAppointmentRequest request,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.updateAppointment(id, request);
      if (response.success) {
        _selectedAppointment = _service.parseSingle(response.data);
        await loadAppointments();
        return true;
      }
      _error = response.message ?? 'Failed to update appointment';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Delete an appointment
  Future<bool> deleteAppointment(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.deleteAppointment(id);
      if (response.success) {
        await loadAppointments();
        return true;
      }
      _error = response.message ?? 'Failed to delete appointment';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Refresh appointments list
  Future<void> refresh() async {
    await loadAppointments();
  }

  /// Clear selected appointment
  void clearSelection() {
    _selectedAppointment = null;
    notifyListeners();
  }
}
