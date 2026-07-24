import '../core/api_client.dart';
import '../models/doctor.dart';

class DoctorService {
  final ApiClient _client = ApiClient();

  /// List doctors with optional filters
  Future<ApiResponse<dynamic>> listDoctors({
    String? clinicId,
    String? search,
    bool? includeInactive,
  }) async {
    final params = <String, dynamic>{};
    if (clinicId != null) params['clinicId'] = clinicId;
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (includeInactive == true) params['includeInactive'] = 'true';
    return _client.get('/api/doctors', queryParameters: params);
  }

  /// Get doctor by ID
  Future<ApiResponse<dynamic>> getDoctor(String id) async {
    return _client.get('/api/doctors/$id');
  }

  /// Update doctor profile
  Future<ApiResponse<dynamic>> updateDoctor(
    String id,
    UpdateDoctorProfileRequest request,
  ) async {
    return _client.patch('/api/doctors/$id', data: request.toJson());
  }

  /// Get working hours for a doctor
  Future<ApiResponse<dynamic>> getWorkingHours(
    String doctorId,
  ) async {
    return _client.get(
      '/api/doctors/working-hours',
      queryParameters: {'doctorId': doctorId},
    );
  }

  /// Update working hours for a doctor
  Future<ApiResponse<dynamic>> updateWorkingHours(
    String doctorId,
    List<ScheduleInput> schedules,
  ) async {
    return _client.put(
      '/api/doctors/working-hours',
      data: {
        'doctorId': doctorId,
        'schedules': schedules.map((s) => s.toJson()).toList(),
      },
    );
  }

  /// Get availability for a doctor or all doctors
  Future<ApiResponse<dynamic>> getAvailability({
    String? doctorId,
    required String startDate,
    required String endDate,
    String? clinicId,
  }) async {
    final params = <String, dynamic>{
      'startDate': startDate,
      'endDate': endDate,
    };
    if (doctorId != null) params['doctorId'] = doctorId;
    if (clinicId != null) params['clinicId'] = clinicId;
    return _client.get('/api/doctors/availability', queryParameters: params);
  }

  /// Get leaves for a doctor
  Future<ApiResponse<dynamic>> getLeaves(
    String doctorId, {
    String? status,
  }) async {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    return _client.get('/api/doctors/$doctorId/leave', queryParameters: params);
  }

  /// Create a leave request
  Future<ApiResponse<dynamic>> createLeave(
    String doctorId,
    CreateLeaveRequest request,
  ) async {
    return _client.post('/api/doctors/$doctorId/leave', data: request.toJson());
  }

  /// Update leave status (approve/reject)
  Future<ApiResponse<dynamic>> updateLeaveStatus(
    String doctorId,
    String leaveId,
    String status,
  ) async {
    return _client.post(
      '/api/doctors/$doctorId/leave',
      data: {'leaveId': leaveId, 'status': status},
    );
  }

  /// Parse list of doctors from response
  List<Doctor> parseList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data.map((e) => Doctor.fromJson(e as Map<String, dynamic>)).toList();
    }
    if (data is Map<String, dynamic>) {
      final list = (data['doctors'] ?? data['data'] ?? data['items']) as List<dynamic>?;
      if (list != null) {
        return list.map((e) => Doctor.fromJson(e as Map<String, dynamic>)).toList();
      }
    }
    return [];
  }

  /// Parse single doctor from response
  Doctor? parseSingle(dynamic data) {
    if (data == null) return null;
    if (data is Map<String, dynamic>) {
      if (data.containsKey('doctor') && data['doctor'] is Map<String, dynamic>) {
        return Doctor.fromJson(data['doctor'] as Map<String, dynamic>);
      }
      if (data.containsKey('data') && data['data'] is Map<String, dynamic>) {
        return Doctor.fromJson(data['data'] as Map<String, dynamic>);
      }
      return Doctor.fromJson(data);
    }
    return null;
  }

  /// Parse working hours schedule list
  List<DoctorSchedule> parseScheduleList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data
          .map((e) => DoctorSchedule.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    if (data is Map<String, dynamic>) {
      final list = (data['schedules'] ?? data['data'] ?? data['items']) as List<dynamic>?;
      if (list != null) {
        return list
            .map((e) => DoctorSchedule.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
    return [];
  }

  /// Parse availability slots
  List<AvailabilitySlot> parseAvailabilityList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data
          .map((e) => AvailabilitySlot.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    if (data is Map<String, dynamic>) {
      final list = (data['availability'] ?? data['data'] ?? data['items']) as List<dynamic>?;
      if (list != null) {
        return list
            .map((e) => AvailabilitySlot.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
    return [];
  }

  /// Parse leaves list
  List<Leave> parseLeavesList(dynamic data) {
    if (data == null) return [];
    if (data is List) {
      return data.map((e) => Leave.fromJson(e as Map<String, dynamic>)).toList();
    }
    if (data is Map<String, dynamic>) {
      final list = (data['leaves'] ?? data['data'] ?? data['items']) as List<dynamic>?;
      if (list != null) {
        return list.map((e) => Leave.fromJson(e as Map<String, dynamic>)).toList();
      }
    }
    return [];
  }
}
