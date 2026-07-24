class User {
  final String id;
  final String? name;
  final String? email;
  final String role;
  final String? clinicId;
  final DateTime? emailVerified;
  final String? image;
  final DateTime? lastLoginAt;
  final ClinicInfo? clinic;

  User({
    required this.id,
    this.name,
    this.email,
    required this.role,
    this.clinicId,
    this.emailVerified,
    this.image,
    this.lastLoginAt,
    this.clinic,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      role: json['role'] as String,
      clinicId: json['clinicId'] as String?,
      emailVerified: json['emailVerified'] != null
          ? DateTime.parse(json['emailVerified'] as String)
          : null,
      image: json['image'] as String?,
      lastLoginAt: json['lastLoginAt'] != null
          ? DateTime.parse(json['lastLoginAt'] as String)
          : null,
      clinic: json['clinic'] != null
          ? ClinicInfo.fromJson(json['clinic'] as Map<String, dynamic>)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'email': email,
    'role': role,
    'clinicId': clinicId,
    'emailVerified': emailVerified?.toIso8601String(),
    'image': image,
    'lastLoginAt': lastLoginAt?.toIso8601String(),
    'clinic': clinic?.toJson(),
  };

  bool get isDoctor => role == 'DOCTOR';
  bool get isSuperAdmin => role == 'SUPER_ADMIN';
  bool get isClinicAdmin => role == 'CLINIC_ADMIN';
  bool get isReceptionist => role == 'RECEPTIONIST';
  bool get isPatient => role == 'PATIENT';
  String get initials {
    if (name == null || name!.isEmpty) return email?[0].toUpperCase() ?? '?';
    final parts = name!.split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
}

class ClinicInfo {
  final String id;
  final String name;
  final String subdomain;
  final String? logo;
  final String? status;

  ClinicInfo({
    required this.id,
    required this.name,
    required this.subdomain,
    this.logo,
    this.status,
  });

  factory ClinicInfo.fromJson(Map<String, dynamic> json) {
    return ClinicInfo(
      id: json['id'] as String,
      name: json['name'] as String,
      subdomain: json['subdomain'] as String,
      logo: json['logo'] as String?,
      status: json['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'subdomain': subdomain,
    'logo': logo,
    'status': status,
  };
}
