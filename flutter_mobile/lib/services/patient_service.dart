import '../core/api_client.dart';
import '../models/patient.dart';

class PatientService {
  final ApiClient _client = ApiClient();

  /// List patients with optional search and clinic filter
  Future<ApiResponse<dynamic>> listPatients({
    String? clinicId,
    String? search,
  }) async {
    final params = <String, dynamic>{};
    if (clinicId != null) params['clinicId'] = clinicId;
    if (search != null && search.isNotEmpty) params['search'] = search;
    return _client.get('/api/patients', queryParameters: params);
  }

  /// Get patient by ID
  Future<ApiResponse<dynamic>> getPatient(String id) async {
    return _client.get('/api/patients/$id');
  }

  /// Create a new patient
  Future<ApiResponse<dynamic>> createPatient(
    CreatePatientRequest request,
  ) async {
    return _client.post('/api/patients', data: request.toJson());
  }

  /// Update an existing patient
  Future<ApiResponse<dynamic>> updatePatient(
    String id,
    UpdatePatientRequest request,
  ) async {
    return _client.patch('/api/patients/$id', data: request.toJson());
  }

  /// Delete a patient
  Future<ApiResponse<dynamic>> deletePatient(String id) async {
    return _client.delete('/api/patients/$id');
  }

  /// Parse list of patients from response
  List<Patient> parseList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data
          .map((e) => Patient.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    if (data is Map<String, dynamic>) {
      final list = (data['patients'] ?? data['data'] ?? data['items']) as List<dynamic>?;
      if (list != null) {
        return list
            .map((e) => Patient.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
    return [];
  }

  /// Parse single patient from response
  Patient? parseSingle(dynamic data) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      if (data.containsKey('patient') && data['patient'] is Map<String, dynamic>) {
        return Patient.fromJson(data['patient'] as Map<String, dynamic>);
      }
      if (data.containsKey('data') && data['data'] is Map<String, dynamic>) {
        return Patient.fromJson(data['data'] as Map<String, dynamic>);
      }
      return Patient.fromJson(data);
    }
    return null;
  }
}
