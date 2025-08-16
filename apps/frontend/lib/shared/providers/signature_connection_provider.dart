import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/signature_connection.dart';
import '../services/signature_connection_service.dart';
import '../../core/api/api_client.dart';

// API Client Provider
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

// Signature Connection Service Provider
final signatureConnectionServiceProvider = Provider<SignatureConnectionService>((ref) {
  final apiClient = ref.watch(apiClientProvider);
  return SignatureConnectionService(apiClient);
});

// Signature Connection Preferences State
final signatureConnectionPreferencesProvider = StateNotifierProvider<SignatureConnectionPreferencesNotifier, AsyncValue<SignatureConnectionPreferences?>>((ref) {
  final service = ref.watch(signatureConnectionServiceProvider);
  return SignatureConnectionPreferencesNotifier(service);
});

class SignatureConnectionPreferencesNotifier extends StateNotifier<AsyncValue<SignatureConnectionPreferences?>> {
  final SignatureConnectionService _service;
  
  SignatureConnectionPreferencesNotifier(this._service) : super(const AsyncValue.loading()) {
    loadPreferences();
  }
  
  Future<void> loadPreferences() async {
    state = const AsyncValue.loading();
    try {
      final preferences = await _service.getPreferences();
      state = AsyncValue.data(preferences);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
  
  Future<void> updatePreferences(SignatureConnectionPreferences preferences) async {
    try {
      await _service.updatePreferences(preferences);
      state = AsyncValue.data(preferences);
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}

// Connection Matches Provider
final connectionMatchesProvider = FutureProvider.family<List<ConnectionMatch>, MatchesParams>((ref, params) async {
  final service = ref.watch(signatureConnectionServiceProvider);
  return service.findMatches(limit: params.limit, offset: params.offset);
});

class MatchesParams {
  final int limit;
  final int offset;
  
  const MatchesParams({this.limit = 20, this.offset = 0});
  
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is MatchesParams &&
          runtimeType == other.runtimeType &&
          limit == other.limit &&
          offset == other.offset;
  
  @override
  int get hashCode => limit.hashCode ^ offset.hashCode;
}

// Connection Stats Provider
final connectionStatsProvider = FutureProvider<SignatureConnectionStats>((ref) async {
  final service = ref.watch(signatureConnectionServiceProvider);
  return service.getStats();
});