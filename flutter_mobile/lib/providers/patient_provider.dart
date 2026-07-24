import 'package:flutter/foundation.dart';
import '../models/patient.dart';
import '../services/patient_service.dart';

class PatientProvider extends ChangeNotifier {
  final PatientService _service = PatientService();

  List<Patient> _patients = [];
  Patient? _selectedPatient;
  bool _isLoading = false;
  String? _error;
  String _searchQuery = '';

  List<Patient> get patients => _patients;
  Patient? get selectedPatient => _selectedPatient;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;

  /// Load patients list
  Future<void> loadPatients({String? clinicId}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.listPatients(
        clinicId: clinicId,
        search: _searchQuery.isNotEmpty ? _searchQuery : null,
      );
      if (response.success) {
        _patients = _service.parseList(response.data);
      } else {
        _error = response.message ?? 'Failed to load patients';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Get patient by ID
  Future<void> loadPatient(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.getPatient(id);
      if (response.success) {
        _selectedPatient = _service.parseSingle(response.data);
      } else {
        _error = response.message ?? 'Failed to load patient';
      }
    } catch (e) {
      _error = 'An unexpected error occurred';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Create a new patient
  Future<bool> createPatient(CreatePatientRequest request) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.createPatient(request);
      if (response.success) {
        await loadPatients();
        return true;
      }
      _error = response.message ?? 'Failed to create patient';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Update an existing patient
  Future<bool> updatePatient(String id, UpdatePatientRequest request) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.updatePatient(id, request);
      if (response.success) {
        _selectedPatient = _service.parseSingle(response.data);
        await loadPatients();
        return true;
      }
      _error = response.message ?? 'Failed to update patient';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Delete a patient
  Future<bool> deletePatient(String id) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await _service.deletePatient(id);
      if (response.success) {
        await loadPatients();
        return true;
      }
      _error = response.message ?? 'Failed to delete patient';
      return false;
    } catch (e) {
      _error = 'An unexpected error occurred';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Set search query
  void setSearch(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  /// Clear selected patient
  void clearSelection() {
    _selectedPatient = null;
    notifyListeners();
  }

  /// Refresh patients list
  Future<void> refresh() async {
    await loadPatients();
  }
}
