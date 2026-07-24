import 'appointment.dart';
import 'patient.dart';

class Doctor {
  final String id;
  final String? name;
  final String? email;
  final String? image;
  final String role;
  final String? clinicId;
  final DoctorProfile? doctorProfile;
  final int? appointmentCount;
  final List<DoctorSchedule>? doctorSchedule;
  final List<Leave>? leaves;
  final ClinicBrief? clinic;

  Doctor({
    required this.id,
    this.name,
    this.email,
    this.image,
    required this.role,
    this.clinicId,
    this.doctorProfile,
    this.appointmentCount,
    this.doctorSchedule,
    this.leaves,
    this.clinic,
  });

  factory Doctor.fromJson(Map<String, dynamic> json) {
    return Doctor(
      id: json['id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      image: json['image'] as String?,
      role: json['role'] as String,
      clinicId: json['clinicId'] as String?,
      doctorProfile: json['doctorProfile'] != null
          ? DoctorProfile.fromJson(
              json['doctorProfile'] as Map<String, dynamic>,
            )
          : null,
      appointmentCount: json['_count'] != null
          ? (json['_count'] as Map<String, dynamic>)['appointments'] as int?
          : null,
      doctorSchedule: json['doctorSchedule'] != null
          ? (json['doctorSchedule'] as List<dynamic>)
                .map((e) => DoctorSchedule.fromJson(e as Map<String, dynamic>))
                .toList()
          : null,
      leaves: json['leaves'] != null
          ? (json['leaves'] as List<dynamic>)
                .map((e) => Leave.fromJson(e as Map<String, dynamic>))
                .toList()
          : null,
      clinic: json['clinic'] != null
          ? ClinicBrief.fromJson(json['clinic'] as Map<String, dynamic>)
          : null,
    );
  }

  String get initials {
    if (name == null || name!.isEmpty) return '?';
    final parts = name!.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}

class DoctorProfile {
  final String id;
  final String? specialty;
  final String? qualification;
  final int? experienceYears;
  final double? consultationFee;
  final String? licenseNumber;
  final String? bio;
  final bool isActive;

  DoctorProfile({
    required this.id,
    this.specialty,
    this.qualification,
    this.experienceYears,
    this.consultationFee,
    this.licenseNumber,
    this.bio,
    required this.isActive,
  });

  factory DoctorProfile.fromJson(Map<String, dynamic> json) {
    return DoctorProfile(
      id: json['id'] as String,
      specialty: json['specialty'] as String?,
      qualification: json['qualification'] as String?,
      experienceYears: json['experienceYears'] as int?,
      consultationFee: (json['consultationFee'] as num?)?.toDouble(),
      licenseNumber: json['licenseNumber'] as String?,
      bio: json['bio'] as String?,
      isActive: json['isActive'] as bool? ?? true,
    );
  }
}

class DoctorSchedule {
  final String id;
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final bool isAvailable;
  final int? slotDuration;

  DoctorSchedule({
    required this.id,
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    required this.isAvailable,
    this.slotDuration,
  });

  factory DoctorSchedule.fromJson(Map<String, dynamic> json) {
    return DoctorSchedule(
      id: json['id'] as String,
      dayOfWeek: json['dayOfWeek'] as String,
      startTime: json['startTime'] as String,
      endTime: json['endTime'] as String,
      isAvailable: json['isAvailable'] as bool? ?? true,
      slotDuration: json['slotDuration'] as int?,
    );
  }

  String get dayLabel {
    return dayOfWeek[0] + dayOfWeek.substring(1).toLowerCase();
  }
}

class ScheduleInput {
  final String dayOfWeek;
  final String startTime;
  final String endTime;
  final bool isAvailable;
  final int? slotDuration;

  ScheduleInput({
    required this.dayOfWeek,
    required this.startTime,
    required this.endTime,
    this.isAvailable = true,
    this.slotDuration,
  });

  Map<String, dynamic> toJson() => {
    'dayOfWeek': dayOfWeek,
    'startTime': startTime,
    'endTime': endTime,
    'isAvailable': isAvailable,
    if (slotDuration != null) 'slotDuration': slotDuration,
  };
}

class Leave {
  final String id;
  final DateTime startDate;
  final DateTime endDate;
  final String? reason;
  final String type;
  final String status;
  final String? approvedById;
  final DoctorBrief? user;
  final ApproverBrief? approvedBy;

  Leave({
    required this.id,
    required this.startDate,
    required this.endDate,
    this.reason,
    required this.type,
    required this.status,
    this.approvedById,
    this.user,
    this.approvedBy,
  });

  factory Leave.fromJson(Map<String, dynamic> json) {
    return Leave(
      id: json['id'] as String,
      startDate: DateTime.parse(json['startDate'] as String),
      endDate: DateTime.parse(json['endDate'] as String),
      reason: json['reason'] as String?,
      type: json['type'] as String,
      status: json['status'] as String,
      approvedById: json['approvedById'] as String?,
      user: json['user'] != null
          ? DoctorBrief.fromJson(json['user'] as Map<String, dynamic>)
          : null,
      approvedBy: json['approvedBy'] != null
          ? ApproverBrief.fromJson(json['approvedBy'] as Map<String, dynamic>)
          : null,
    );
  }

  String get statusLabel {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      default:
        return status;
    }
  }

  String get typeLabel {
    switch (type) {
      case 'VACATION':
        return 'Vacation';
      case 'SICK':
        return 'Sick';
      case 'PERSONAL':
        return 'Personal';
      default:
        return 'Other';
    }
  }
}

class ApproverBrief {
  final String id;
  final String? name;

  ApproverBrief({required this.id, this.name});

  factory ApproverBrief.fromJson(Map<String, dynamic> json) {
    return ApproverBrief(
      id: json['id'] as String,
      name: json['name'] as String?,
    );
  }
}

class AvailabilitySlot {
  final String date;
  final String dayOfWeek;
  final bool isAvailable;
  final String? startTime;
  final String? endTime;
  final int? slotDuration;
  final String? leaveType;

  AvailabilitySlot({
    required this.date,
    required this.dayOfWeek,
    required this.isAvailable,
    this.startTime,
    this.endTime,
    this.slotDuration,
    this.leaveType,
  });

  factory AvailabilitySlot.fromJson(Map<String, dynamic> json) {
    return AvailabilitySlot(
      date: json['date'] as String,
      dayOfWeek: json['dayOfWeek'] as String,
      isAvailable: json['isAvailable'] as bool,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
      slotDuration: json['slotDuration'] as int?,
      leaveType: json['leaveType'] as String?,
    );
  }
}

class CreateLeaveRequest {
  final String startDate;
  final String endDate;
  final String? reason;
  final String? type;

  CreateLeaveRequest({
    required this.startDate,
    required this.endDate,
    this.reason,
    this.type,
  });

  Map<String, dynamic> toJson() => {
    'startDate': startDate,
    'endDate': endDate,
    if (reason != null) 'reason': reason,
    if (type != null) 'type': type,
  };
}

class UpdateDoctorProfileRequest {
  final String? name;
  final String? email;
  final String? specialty;
  final String? qualification;
  final int? experienceYears;
  final double? consultationFee;
  final String? licenseNumber;
  final String? bio;
  final bool? isActive;

  UpdateDoctorProfileRequest({
    this.name,
    this.email,
    this.specialty,
    this.qualification,
    this.experienceYears,
    this.consultationFee,
    this.licenseNumber,
    this.bio,
    this.isActive,
  });

  Map<String, dynamic> toJson() => {
    if (name != null) 'name': name,
    if (email != null) 'email': email,
    if (specialty != null) 'specialty': specialty,
    if (qualification != null) 'qualification': qualification,
    if (experienceYears != null) 'experienceYears': experienceYears,
    if (consultationFee != null) 'consultationFee': consultationFee,
    if (licenseNumber != null) 'licenseNumber': licenseNumber,
    if (bio != null) 'bio': bio,
    if (isActive != null) 'isActive': isActive,
  };
}
