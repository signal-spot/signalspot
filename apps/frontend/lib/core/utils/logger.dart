import 'dart:io';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:logger/logger.dart' as logger;
import 'package:path_provider/path_provider.dart';
// import 'package:sentry_flutter/sentry_flutter.dart'; // TODO: Add to pubspec.yaml if needed
import '../config/environment.dart';

enum LogLevel {
  debug,
  info,
  warning,
  error,
  fatal,
}

class Logger {
  static late logger.Logger _logger;
  static late File? _logFile;
  static final List<LogEntry> _logBuffer = [];
  static const int _maxBufferSize = 1000;
  static bool _initialized = false;
  
  static Future<void> initialize() async {
    if (_initialized) return;
    
    // Configure logger based on environment
    final outputs = <logger.LogOutput>[];
    
    // Console output for development
    if (Environment.getValue<bool>('logging.enableConsoleLog') ?? false) {
      outputs.add(logger.ConsoleOutput());
    }
    
    // File output for production
    if (Environment.getValue<bool>('logging.enableFileLog') ?? false) {
      await _initializeFileLogging();
      if (_logFile != null) {
        outputs.add(_FileOutput(_logFile!));
      }
    }
    
    // Remote logging (Sentry) for non-development
    if (Environment.getValue<bool>('logging.enableRemoteLog') ?? false) {
      outputs.add(_SentryOutput());
    }
    
    _logger = logger.Logger(
      printer: _CustomPrinter(),
      output: logger.MultiOutput(outputs),
      filter: _EnvironmentFilter(),
      level: _getLogLevel(),
    );
    
    _initialized = true;
    
    // Log initialization
    info('Logger initialized', {
      'environment': Environment.current.name,
      'logLevel': _getLogLevel().name,
    });
  }
  
  static Future<void> _initializeFileLogging() async {
    try {
      final directory = await getApplicationDocumentsDirectory();
      final logDir = Directory('${directory.path}/logs');
      
      if (!await logDir.exists()) {
        await logDir.create(recursive: true);
      }
      
      final timestamp = DateTime.now().toIso8601String().replaceAll(':', '-');
      _logFile = File('${logDir.path}/signalspot_$timestamp.log');
      
      // Rotate logs if needed
      await _rotateLogs(logDir);
    } catch (e) {
      if (kDebugMode) {
        print('Failed to initialize file logging: $e');
      }
    }
  }
  
  static Future<void> _rotateLogs(Directory logDir) async {
    final logs = await logDir.list().toList();
    final logFiles = logs.whereType<File>().toList();
    
    // Keep only last 7 days of logs
    if (logFiles.length > 7) {
      logFiles.sort((a, b) => a.path.compareTo(b.path));
      
      for (int i = 0; i < logFiles.length - 7; i++) {
        await logFiles[i].delete();
      }
    }
  }
  
  static logger.Level _getLogLevel() {
    final levelStr = Environment.getValue<String>('logging.level') ?? 'info';
    
    switch (levelStr.toLowerCase()) {
      case 'debug':
        return logger.Level.debug;
      case 'info':
        return logger.Level.info;
      case 'warning':
        return logger.Level.warning;
      case 'error':
        return logger.Level.error;
      default:
        return logger.Level.info;
    }
  }
  
  // Logging methods
  static void debug(String message, [dynamic data]) {
    if (!_initialized) _quickInit();
    _logger.d(message, error: data);
    _addToBuffer(LogLevel.debug, message, data);
  }
  
  static void info(String message, [dynamic data]) {
    if (!_initialized) _quickInit();
    _logger.i(message, error: data);
    _addToBuffer(LogLevel.info, message, data);
  }
  
  static void warning(String message, [dynamic data]) {
    if (!_initialized) _quickInit();
    _logger.w(message, error: data);
    _addToBuffer(LogLevel.warning, message, data);
  }
  
  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    if (!_initialized) _quickInit();
    _logger.e(message, error: error, stackTrace: stackTrace);
    _addToBuffer(LogLevel.error, message, {'error': error, 'stackTrace': stackTrace});
    
    // TODO: Send to Sentry when package is added
    // if (Environment.getValue<bool>('logging.enableRemoteLog') ?? false) {
    //   Sentry.captureException(error, stackTrace: stackTrace);
    // }
  }
  
  static void fatal(String message, [dynamic error, StackTrace? stackTrace]) {
    if (!_initialized) _quickInit();
    _logger.f(message, error: error, stackTrace: stackTrace);
    _addToBuffer(LogLevel.fatal, message, {'error': error, 'stackTrace': stackTrace});
    
    // TODO: Send fatal errors to Sentry when package is added
    // Sentry.captureException(
    //   error ?? Exception(message),
    //   stackTrace: stackTrace,
    //   withScope: (scope) {
    //     scope.level = SentryLevel.fatal;
    //   },
    // );
  }
  
  static void _quickInit() {
    _logger = logger.Logger(
      printer: logger.PrettyPrinter(),
      output: logger.ConsoleOutput(),
    );
  }
  
  static void _addToBuffer(LogLevel level, String message, dynamic data) {
    final entry = LogEntry(
      timestamp: DateTime.now(),
      level: level,
      message: message,
      data: data,
    );
    
    _logBuffer.add(entry);
    
    if (_logBuffer.length > _maxBufferSize) {
      _logBuffer.removeAt(0);
    }
  }
  
  // Get recent logs
  static List<LogEntry> getRecentLogs([int count = 100]) {
    final start = _logBuffer.length > count ? _logBuffer.length - count : 0;
    return _logBuffer.sublist(start);
  }
  
  // Clear logs
  static void clearLogs() {
    _logBuffer.clear();
  }
  
  // Export logs
  static Future<String> exportLogs() async {
    final logs = _logBuffer.map((e) => e.toJson()).toList();
    return jsonEncode(logs);
  }
  
  // Performance logging
  static void logPerformance(String operation, Duration duration, [Map<String, dynamic>? metrics]) {
    info('Performance: $operation', {
      'duration_ms': duration.inMilliseconds,
      ...?metrics,
    });
  }
  
  // Network logging
  static void logNetwork({
    required String method,
    required String url,
    int? statusCode,
    Duration? duration,
    dynamic error,
  }) {
    final data = {
      'method': method,
      'url': url,
      'statusCode': statusCode,
      'duration_ms': duration?.inMilliseconds,
      'error': error?.toString(),
    };
    
    if (error != null) {
      warning('Network request failed', data);
    } else {
      debug('Network request', data);
    }
  }
  
  // Analytics logging
  static void logAnalytics(String event, [Map<String, dynamic>? parameters]) {
    info('Analytics: $event', parameters);
    
    // Send to analytics service if enabled
    if (Environment.enableAnalytics) {
      // Analytics implementation here
    }
  }
  
  // User action logging
  static void logUserAction(String action, [Map<String, dynamic>? details]) {
    info('User Action: $action', details);
  }
}

// Custom printer for better formatting
class _CustomPrinter extends logger.LogPrinter {
  @override
  List<String> log(logger.LogEvent event) {
    final color = const {}[event.level] ?? (String text) => text;
    final emoji = const {}[event.level] ?? '';
    final time = DateTime.now().toIso8601String();
    
    final buffer = StringBuffer();
    buffer.write(color('$time $emoji ${event.level.name.toUpperCase()}: '));
    buffer.write(event.message);
    
    if (event.error != null) {
      buffer.write('\n${event.error}');
    }
    
    if (event.stackTrace != null) {
      buffer.write('\n${event.stackTrace}');
    }
    
    return [buffer.toString()];
  }
}

// File output implementation
class _FileOutput extends logger.LogOutput {
  final File file;
  
  _FileOutput(this.file);
  
  @override
  void output(logger.OutputEvent event) {
    try {
      final lines = event.lines.join('\n');
      file.writeAsStringSync('$lines\n', mode: FileMode.append);
    } catch (e) {
      if (kDebugMode) {
        print('Failed to write to log file: $e');
      }
    }
  }
}

// Sentry output implementation
class _SentryOutput extends logger.LogOutput {
  @override
  void output(logger.OutputEvent event) {
    if (event.level.index >= logger.Level.warning.index) {
      // TODO: Send to Sentry when package is added
      // final message = event.lines.join('\n');
      // Sentry.captureMessage(
      //   message,
      //   level: _mapLogLevel(event.level),
      // );
    }
  }
  
  // TODO: Uncomment when Sentry is added
  // SentryLevel _mapLogLevel(logger.Level level) {
  //   switch (level) {
  //     case logger.Level.debug:
  //       return SentryLevel.debug;
  //     case logger.Level.info:
  //       return SentryLevel.info;
  //     case logger.Level.warning:
  //       return SentryLevel.warning;
  //     case logger.Level.error:
  //       return SentryLevel.error;
  //     case logger.Level.fatal:
  //       return SentryLevel.fatal;
  //     default:
  //       return SentryLevel.info;
  //   }
  // }
}

// Environment-based filter
class _EnvironmentFilter extends logger.LogFilter {
  @override
  bool shouldLog(logger.LogEvent event) {
    if (Environment.isDevelopment) {
      return true; // Log everything in development
    }
    
    if (Environment.isStaging) {
      return event.level.index >= logger.Level.info.index;
    }
    
    // Production - only warnings and above
    return event.level.index >= logger.Level.warning.index;
  }
}

// Log entry model
class LogEntry {
  final DateTime timestamp;
  final LogLevel level;
  final String message;
  final dynamic data;
  
  LogEntry({
    required this.timestamp,
    required this.level,
    required this.message,
    this.data,
  });
  
  Map<String, dynamic> toJson() => {
    'timestamp': timestamp.toIso8601String(),
    'level': level.name,
    'message': message,
    'data': data?.toString(),
  };
}