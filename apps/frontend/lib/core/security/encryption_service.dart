import 'dart:convert';
import 'dart:typed_data';
import 'package:crypto/crypto.dart';
import 'package:encrypt/encrypt.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../config/environment.dart';

class EncryptionService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
    ),
  );
  
  static late final Encrypter _encrypter;
  static late final IV _iv;
  static bool _initialized = false;
  
  static Future<void> initialize() async {
    if (_initialized) return;
    
    // Get or generate encryption key
    String? storedKey = await _storage.read(key: 'encryption_key');
    
    if (storedKey == null) {
      // Generate new key for this device
      final key = _generateKey();
      await _storage.write(key: 'encryption_key', value: key);
      storedKey = key;
    }
    
    final keyBytes = _padKey(storedKey);
    final key = Key(keyBytes);
    _iv = IV.fromSecureRandom(16);
    _encrypter = Encrypter(AES(key, mode: AESMode.cbc));
    
    _initialized = true;
  }
  
  static Uint8List _padKey(String key) {
    final bytes = utf8.encode(key);
    final padded = Uint8List(32);
    
    for (int i = 0; i < 32; i++) {
      padded[i] = i < bytes.length ? bytes[i] : 0;
    }
    
    return padded;
  }
  
  static String _generateKey() {
    final timestamp = DateTime.now().millisecondsSinceEpoch.toString();
    final deviceId = Environment.encryptionKey.isNotEmpty 
        ? Environment.encryptionKey 
        : 'default_key';
    final combined = '$deviceId$timestamp';
    final hash = sha256.convert(utf8.encode(combined));
    return hash.toString().substring(0, 32);
  }
  
  /// Encrypt string data
  static String encrypt(String plainText) {
    if (!_initialized) {
      throw Exception('EncryptionService not initialized');
    }
    
    final encrypted = _encrypter.encrypt(plainText, iv: _iv);
    return encrypted.base64;
  }
  
  /// Decrypt string data
  static String decrypt(String encryptedText) {
    if (!_initialized) {
      throw Exception('EncryptionService not initialized');
    }
    
    final encrypted = Encrypted.fromBase64(encryptedText);
    return _encrypter.decrypt(encrypted, iv: _iv);
  }
  
  /// Encrypt JSON data
  static String encryptJson(Map<String, dynamic> data) {
    final jsonString = jsonEncode(data);
    return encrypt(jsonString);
  }
  
  /// Decrypt JSON data
  static Map<String, dynamic> decryptJson(String encryptedData) {
    final decrypted = decrypt(encryptedData);
    return jsonDecode(decrypted) as Map<String, dynamic>;
  }
  
  /// Hash sensitive data (one-way)
  static String hash(String data) {
    final bytes = utf8.encode(data);
    final hash = sha256.convert(bytes);
    return hash.toString();
  }
  
  /// Store sensitive data securely
  static Future<void> secureStore(String key, String value) async {
    final encrypted = encrypt(value);
    await _storage.write(key: key, value: encrypted);
  }
  
  /// Retrieve sensitive data securely
  static Future<String?> secureRetrieve(String key) async {
    final encrypted = await _storage.read(key: key);
    if (encrypted == null) return null;
    
    try {
      return decrypt(encrypted);
    } catch (e) {
      // If decryption fails, remove corrupted data
      await _storage.delete(key: key);
      return null;
    }
  }
  
  /// Remove sensitive data
  static Future<void> secureDelete(String key) async {
    await _storage.delete(key: key);
  }
  
  /// Clear all secure storage
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
  
  /// Store auth tokens securely
  static Future<void> storeTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await secureStore('access_token', accessToken);
    await secureStore('refresh_token', refreshToken);
    await _storage.write(
      key: 'token_timestamp',
      value: DateTime.now().millisecondsSinceEpoch.toString(),
    );
  }
  
  /// Retrieve auth tokens
  static Future<Map<String, String?>> getTokens() async {
    return {
      'accessToken': await secureRetrieve('access_token'),
      'refreshToken': await secureRetrieve('refresh_token'),
    };
  }
  
  /// Check if tokens are expired (basic check)
  static Future<bool> areTokensExpired() async {
    final timestampStr = await _storage.read(key: 'token_timestamp');
    if (timestampStr == null) return true;
    
    final timestamp = int.tryParse(timestampStr) ?? 0;
    final now = DateTime.now().millisecondsSinceEpoch;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return (now - timestamp) > maxAge;
  }
  
  /// Clear auth tokens
  static Future<void> clearTokens() async {
    await secureDelete('access_token');
    await secureDelete('refresh_token');
    await _storage.delete(key: 'token_timestamp');
  }
}