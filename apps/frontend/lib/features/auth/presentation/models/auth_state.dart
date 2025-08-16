import '../../data/models/auth_models.dart';

abstract class AuthState {
  const AuthState();
  
  const factory AuthState.initial() = InitialState;
  const factory AuthState.loading() = LoadingState;
  const factory AuthState.authenticated(User user) = AuthenticatedState;
  const factory AuthState.unauthenticated() = UnauthenticatedState;
  const factory AuthState.error(String message) = ErrorState;
  const factory AuthState.phoneVerificationRequired() = PhoneVerificationRequiredState;
  const factory AuthState.phoneVerified(String phoneNumber) = PhoneVerifiedState;
  const factory AuthState.smsVerificationRequired(String phoneNumber) = SmsVerificationRequiredState;
}

class InitialState extends AuthState {
  const InitialState();
}

class LoadingState extends AuthState {
  const LoadingState();
}

class AuthenticatedState extends AuthState {
  final User user;
  const AuthenticatedState(this.user);
}

class UnauthenticatedState extends AuthState {
  const UnauthenticatedState();
}

class ErrorState extends AuthState {
  final String message;
  const ErrorState(this.message);
}

class PhoneVerificationRequiredState extends AuthState {
  const PhoneVerificationRequiredState();
}

class PhoneVerifiedState extends AuthState {
  final String phoneNumber;
  const PhoneVerifiedState(this.phoneNumber);
}

class SmsVerificationRequiredState extends AuthState {
  final String phoneNumber;
  const SmsVerificationRequiredState(this.phoneNumber);
}