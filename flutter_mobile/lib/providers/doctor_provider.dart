import 'package:flutter/foundation.dart';
import '../models/doctor.dart';
import '../services/doctor_service.dart';

class DoctorProvider extends ChangeNotifier {
  final DoctorService _service = DoctorService();

  List<Doctor> _doctors = [];
  Doctor? _selectedDoctor;
  List<DoctorSchedule> _schedules = [];
  List<Leave> _leaves = [];
  List<AvailabilitySlot> _availability = [];
  bool _isLoading = false;
  String? _error;

  List<Doctor> get doctors => _doctors;
  Doctor? get selectedDoctor => _selectedDoctor;
  List<DoctorSchedule> get schedules => _schedules;
  List<Leave> get leaves => _leaves;
  List<AvailabilitySlot> get availability => _availability;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Load doctors list
  Future<void> loadDoctors({String? clinicId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.listDoctors(clinicId: clinicId);
      if (response.success) {
        _doctors = _service.parseList(response.data);
      } else {
        _error = response.message ?? 'Failed to load doctors';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Get doctor by ID
  Future<void> loadDoctor(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.getDoctor(id);
      if (response.success) {
        _selectedDoctor = _service.parseSingle(response.data);
      } else {
        _error = response.message ?? 'Failed to load doctor';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Update doctor profile
  Future<bool> updateDoctor(
    String id,
    UpdateDoctorProfileRequest request,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.updateDoctor(id, request);
      if (response.success) {
        _selectedDoctor = _service.parseSingle(response.data);
        return true;
      }
      _error = response.message ?? 'Failed to update doctor';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load working hours for a doctor
  Future<void> loadWorkingHours(String doctorId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.getWorkingHours(doctorId);
      if (response.success) {
        _schedules = _service.parseScheduleList(response.data);
      } else {
        _error = response.message ?? 'Failed to load schedule';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Update working hours for a doctor
  Future<bool> updateWorkingHours(
    String doctorId,
    List<ScheduleInput> schedules,
  ) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.updateWorkingHours(doctorId, schedules);
      if (response.success) {
        _schedules = _service.parseScheduleList(response.data);
        return true;
      }
      _error = response.message ?? 'Failed to update schedule';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load availability for a doctor
  Future<void> loadAvailability({
    String? doctorId,
    required String startDate,
    required String endDate,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.getAvailability(
        doctorId: doctorId,
        startDate: startDate,
        endDate: endDate,
      );
      if (response.success) {
        _availability = _service.parseAvailabilityList(response.data);
      } else {
        _error = response.message ?? 'Failed to load availability';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Load leaves for a doctor
  Future<void> loadLeaves(String doctorId, {String? status}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.getLeaves(doctorId, status: status);
      if (response.success) {
        _leaves = _service.parseLeavesList(response.data);
      } else {
        _error = response.message ?? 'Failed to load leaves';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Create a leave request
  Future<bool> createLeave(String doctorId, CreateLeaveRequest request) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.createLeave(doctorId, request);
      if (response.success) {
        await loadLeaves(doctorId);
        return true;
      }
      _error = response.message ?? 'Failed to create leave';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Clear selected doctor
  void clearSelection() {
    _selectedDoctor = null;
    notifyListeners();
  }

  /// Refresh all doctor data
  Future<void> refresh() async {
    await loadDoctors();
  }
}
