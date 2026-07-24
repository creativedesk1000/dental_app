import '../core/api_client.dart';
import '../models/appointment.dart';

class AppointmentService {
  final ApiClient _client = ApiClient();

  /// List appointments with optional filters
  Future<ApiResponse<dynamic>> listAppointments({
    String? clinicId,
    String? doctorId,
    String? patientId,
    String? status,
    DateTime? startDate,
    DateTime? endDate,
  }) async {
    final params = <String, dynamic>{};
    if (clinicId != null) params['clinicId'] = clinicId;
    if (doctorId != null) params['doctorId'] = doctorId;
    if (patientId != null) params['patientId'] = patientId;
    if (status != null) params['status'] = status;
    if (startDate != null) params['startDate'] = startDate.toIso8601String();
    if (endDate != null) params['endDate'] = endDate.toIso8601String();
    return _client.get('/api/appointments', queryParameters: params);
  }

  /// Get appointment by ID
  Future<ApiResponse<dynamic>> getAppointment(String id) async {
    return _client.get('/api/appointments/$id');
  }

  /// Create a new appointment
  Future<ApiResponse<dynamic>> createAppointment(
    CreateAppointmentRequest request,
  ) async {
    return _client.post('/api/appointments', data: request.toJson());
  }

  /// Update an existing appointment
  Future<ApiResponse<dynamic>> updateAppointment(
    String id,
    UpdateAppointmentRequest request,
  ) async {
    return _client.patch('/api/appointments/$id', data: request.toJson());
  }

  /// Delete an appointment
  Future<ApiResponse<dynamic>> deleteAppointment(String id) async {
    return _client.delete('/api/appointments/$id');
  }

  /// Parse list of appointments from response
  List<Appointment> parseList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data
          .map((e) => Appointment.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    if (data is Map<String, dynamic>) {
      final list = (data['appointments'] ?? data['data'] ?? data['items']) as List<dynamic>?;
      if (list != null) {
        return list
            .map((e) => Appointment.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
    return [];
  }

  /// Parse single appointment from response
  Appointment? parseSingle(dynamic data) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      if (data.containsKey('appointment') && data['appointment'] is Map<String, dynamic>) {
        return Appointment.fromJson(data['appointment'] as Map<String, dynamic>);
      }
      if (data.containsKey('data') && data['data'] is Map<String, dynamic>) {
        return Appointment.fromJson(data['data'] as Map<String, dynamic>);
      }
      return Appointment.fromJson(data);
    }
    return null;
  }
}
