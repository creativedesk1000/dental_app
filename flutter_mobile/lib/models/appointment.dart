class Appointment {
  final String id;
  final DateTime date;
  final String? notes;
  final String status;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String clinicId;
  final String patientId;
  final String doctorId;
  final PatientBrief? patient;
  final DoctorBrief? doctor;

  Appointment({
    required this.id,
    required this.date,
    this.notes,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
    required this.clinicId,
    required this.patientId,
    required this.doctorId,
    this.patient,
    this.doctor,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    return Appointment(
      id: json['id'] as String,
      date: DateTime.parse(json['date'] as String),
      notes: json['notes'] as String?,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      clinicId: json['clinicId'] as String,
      patientId: json['patientId'] as String,
      doctorId: json['doctorId'] as String,
      patient: json['patient'] != null
          ? PatientBrief.fromJson(json['patient'] as Map<String, dynamic>)
          : null,
      doctor: json['doctor'] != null
          ? DoctorBrief.fromJson(json['doctor'] as Map<String, dynamic>)
          : null,
    );
  }

  bool get isScheduled => status == 'SCHEDULED';
  bool get isCompleted => status == 'COMPLETED';
  bool get isCancelled => status == 'CANCELLED';
  bool get isNoShow => status == 'NO_SHOW';

  String get statusLabel {
    switch (status) {
      case 'SCHEDULED':
        return 'Scheduled';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      case 'NO_SHOW':
        return 'No Show';
      default:
        return status;
    }
  }
}

class PatientBrief {
  final String id;
  final String firstName;
  final String lastName;

  PatientBrief({
    required this.id,
    required this.firstName,
    required this.lastName,
  });

  factory PatientBrief.fromJson(Map<String, dynamic> json) {
    return PatientBrief(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
    );
  }

  String get fullName => '$firstName $lastName';
}

class DoctorBrief {
  final String id;
  final String? name;
  final String? email;

  DoctorBrief({required this.id, this.name, this.email});

  factory DoctorBrief.fromJson(Map<String, dynamic> json) {
    return DoctorBrief(
      id: json['id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
    );
  }
}

class CreateAppointmentRequest {
  final String patientId;
  final String doctorId;
  final String date;
  final String? notes;

  CreateAppointmentRequest({
    required this.patientId,
    required this.doctorId,
    required this.date,
    this.notes,
  });

  Map<String, dynamic> toJson() => {
    'patientId': patientId,
    'doctorId': doctorId,
    'date': date,
    if (notes != null) 'notes': notes,
  };
}

class UpdateAppointmentRequest {
  final String? date;
  final String? notes;
  final String? status;
  final String? doctorId;
  final String? patientId;

  UpdateAppointmentRequest({
    this.date,
    this.notes,
    this.status,
    this.doctorId,
    this.patientId,
  });

  Map<String, dynamic> toJson() => {
    if (date != null) 'date': date,
    if (notes != null) 'notes': notes,
    if (status != null) 'status': status,
    if (doctorId != null) 'doctorId': doctorId,
    if (patientId != null) 'patientId': patientId,
  };
}
