class LoginRequest {
  final String email;
  final String password;
  final bool rememberMe;

  LoginRequest({
    required this.email,
    required this.password,
    this.rememberMe = false,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    'rememberMe': rememberMe,
  };
}

class RegisterClinicRequest {
  final String name;
  final String email;
  final String password;
  final String clinicName;
  final String subdomain;
  final String? phone;
  final String? address;

  RegisterClinicRequest({
    required this.name,
    required this.email,
    required this.password,
    required this.clinicName,
    required this.subdomain,
    this.phone,
    this.address,
  });

  Map<String, dynamic> toJson() => {
    'name': name,
    'email': email,
    'password': password,
    'clinicName': clinicName,
    'subdomain': subdomain,
    'phone': phone,
    'address': address,
  };
}

class ForgotPasswordRequest {
  final String email;

  ForgotPasswordRequest({required this.email});

  Map<String, dynamic> toJson() => {'email': email};
}

class ResetPasswordRequest {
  final String email;
  final String token;
  final String password;

  ResetPasswordRequest({
    required this.email,
    required this.token,
    required this.password,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'token': token,
    'password': password,
  };
}

class ChangePasswordRequest {
  final String currentPassword;
  final String newPassword;

  ChangePasswordRequest({
    required this.currentPassword,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() => {
    'currentPassword': currentPassword,
    'newPassword': newPassword,
  };
}

class AuthResult {
  final String? sessionTokenId;
  final Map<String, dynamic>? user;

  AuthResult({this.sessionTokenId, this.user});

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      sessionTokenId: json['sessionTokenId'] as String?,
      user: json['user'] as Map<String, dynamic>?,
    );
  }
}

class MessageResponse {
  final String message;

  MessageResponse({required this.message});

  factory MessageResponse.fromJson(Map<String, dynamic> json) {
    return MessageResponse(message: json['message'] as String);
  }
}
