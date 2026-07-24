class Patient {
  final String id;
  final String firstName;
  final String lastName;
  final String? email;
  final String? phone;
  final DateTime? dob;
  final DateTime createdAt;
  final DateTime updatedAt;
  final String clinicId;
  final int? appointmentCount;
  final ClinicBrief? clinic;

  Patient({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.email,
    this.phone,
    this.dob,
    required this.createdAt,
    required this.updatedAt,
    required this.clinicId,
    this.appointmentCount,
    this.clinic,
  });

  factory Patient.fromJson(Map<String, dynamic> json) {
    return Patient(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      dob: json['dob'] != null ? DateTime.parse(json['dob'] as String) : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
      clinicId: json['clinicId'] as String,
      appointmentCount: json['_count'] != null
          ? (json['_count'] as Map<String, dynamic>)['appointments'] as int?
          : null,
      clinic: json['clinic'] != null
          ? ClinicBrief.fromJson(json['clinic'] as Map<String, dynamic>)
          : null,
    );
  }

  String get fullName => '$firstName $lastName';
}

class ClinicBrief {
  final String id;
  final String name;

  ClinicBrief({required this.id, required this.name});

  factory ClinicBrief.fromJson(Map<String, dynamic> json) {
    return ClinicBrief(id: json['id'] as String, name: json['name'] as String);
  }
}

class CreatePatientRequest {
  final String firstName;
  final String lastName;
  final String? email;
  final String? phone;
  final String? dob;
  final String? clinicId;

  CreatePatientRequest({
    required this.firstName,
    required this.lastName,
    this.email,
    this.phone,
    this.dob,
    this.clinicId,
  });

  Map<String, dynamic> toJson() => {
    'firstName': firstName,
    'lastName': lastName,
    'email': email,
    'phone': phone,
    'dob': dob,
    if (clinicId != null) 'clinicId': clinicId,
  };
}

class UpdatePatientRequest {
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? phone;
  final String? dob;

  UpdatePatientRequest({
    this.firstName,
    this.lastName,
    this.email,
    this.phone,
    this.dob,
  });

  Map<String, dynamic> toJson() => {
    if (firstName != null) 'firstName': firstName,
    if (lastName != null) 'lastName': lastName,
    if (email != null) 'email': email,
    if (phone != null) 'phone': phone,
    if (dob != null) 'dob': dob,
  };
}
