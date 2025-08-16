import 'package:json_annotation/json_annotation.dart';

part 'auth_models.g.dart';

@JsonSerializable()
class LoginRequest {
  final String email;
  final String password;
  
  LoginRequest({
    required this.email,
    required this.password,
  });
  
  factory LoginRequest.fromJson(Map<String, dynamic> json) => 
      _$LoginRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$LoginRequestToJson(this);
}

@JsonSerializable()
class RegisterRequest {
  final String email;
  final String password;
  final String username;
  
  RegisterRequest({
    required this.email,
    required this.password,
    required this.username,
  });
  
  factory RegisterRequest.fromJson(Map<String, dynamic> json) => 
      _$RegisterRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);
}

@JsonSerializable()
class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final User user;
  
  AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });
  
  factory AuthResponse.fromJson(Map<String, dynamic> json) => 
      _$AuthResponseFromJson(json);
  
  Map<String, dynamic> toJson() => _$AuthResponseToJson(this);
}


@JsonSerializable()
class User {
  final String id;
  final String email;
  final String username;
  final String? firstName;
  final String? lastName;
  final String? phoneNumber;
  final bool? isEmailVerified;
  final bool? profileCompleted;
  final DateTime? createdAt;
  final DateTime? lastLoginAt;
  
  User({
    required this.id,
    required this.email,
    required this.username,
    this.firstName,
    this.lastName,
    this.phoneNumber,
    this.isEmailVerified,
    this.profileCompleted,
    this.createdAt,
    this.lastLoginAt,
  });
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  
  Map<String, dynamic> toJson() => _$UserToJson(this);
  
  String get displayName {
    if (firstName != null && lastName != null) {
      return '$firstName $lastName';
    } else if (firstName != null) {
      return firstName!;
    } else {
      return username;
    }
  }
}

@JsonSerializable()
class RefreshTokenRequest {
  final String refreshToken;
  
  RefreshTokenRequest({required this.refreshToken});
  
  factory RefreshTokenRequest.fromJson(Map<String, dynamic> json) => 
      _$RefreshTokenRequestFromJson(json);
  
  Map<String, dynamic> toJson() => _$RefreshTokenRequestToJson(this);
}

@JsonSerializable()
class RefreshTokenResponse {
  final String accessToken;
  
  RefreshTokenResponse({required this.accessToken});
  
  factory RefreshTokenResponse.fromJson(Map<String, dynamic> json) => 
      _$RefreshTokenResponseFromJson(json);
  
  Map<String, dynamic> toJson() => _$RefreshTokenResponseToJson(this);
}