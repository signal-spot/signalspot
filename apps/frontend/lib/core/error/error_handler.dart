import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../utils/logger.dart';
import '../api/enhanced_api_client.dart';

class ErrorHandler {
  static final Map<Type, ErrorHandlerCallback> _handlers = {};
  static final List<GlobalErrorCallback> _globalCallbacks = [];
  
  /// Initialize error handling
  static void initialize() {
    // Register default handlers
    registerHandler<NetworkException>(_handleNetworkError);
    registerHandler<UnauthorizedException>(_handleUnauthorizedError);
    registerHandler<ServerException>(_handleServerError);
    registerHandler<PlatformException>(_handlePlatformError);
    registerHandler<FormatException>(_handleFormatError);
    registerHandler<TypeError>(_handleTypeError);
  }
  
  /// Register a handler for a specific error type
  static void registerHandler<T>(ErrorHandlerCallback<T> handler) {
    _handlers[T] = handler as ErrorHandlerCallback<dynamic>;
  }
  
  /// Register a global error callback
  static void registerGlobalCallback(GlobalErrorCallback callback) {
    _globalCallbacks.add(callback);
  }
  
  /// Handle an error
  static ErrorResult handle(
    dynamic error, {
    StackTrace? stackTrace,
    BuildContext? context,
    String? operation,
  }) {
    // Log the error
    Logger.error('Error during ${operation ?? 'operation'}', error, stackTrace);
    
    // Find appropriate handler
    final handler = _handlers[error.runtimeType];
    ErrorResult result;
    
    if (handler != null) {
      result = handler(error);
    } else {
      result = _handleUnknownError(error);
    }
    
    // Call global callbacks
    for (final callback in _globalCallbacks) {
      callback(error, result);
    }
    
    // Show UI feedback if context is available
    if (context != null && context.mounted) {
      _showErrorUI(context, result);
    }
    
    return result;
  }
  
  /// Handle with retry capability
  static Future<T?> handleWithRetry<T>({
    required Future<T> Function() operation,
    required BuildContext context,
    int maxRetries = 3,
    Duration retryDelay = const Duration(seconds: 1),
    String? operationName,
  }) async {
    int attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        return await operation();
      } catch (error, stackTrace) {
        attempts++;
        
        final result = handle(
          error,
          stackTrace: stackTrace,
          context: context,
          operation: operationName,
        );
        
        if (!result.isRetryable || attempts >= maxRetries) {
          return null;
        }
        
        // Wait before retry
        await Future.delayed(retryDelay * attempts);
      }
    }
    
    return null;
  }
  
  // Default error handlers
  static ErrorResult _handleNetworkError(NetworkException error) {
    return ErrorResult(
      message: 'No internet connection. Please check your network settings.',
      userMessage: 'No internet connection',
      isRetryable: true,
      errorCode: 'NETWORK_ERROR',
      actions: [
        ErrorAction(
          label: 'Retry',
          action: () {},
        ),
        ErrorAction(
          label: 'Settings',
          action: () => _openNetworkSettings(),
        ),
      ],
    );
  }
  
  static ErrorResult _handleUnauthorizedError(UnauthorizedException error) {
    return ErrorResult(
      message: 'Your session has expired. Please login again.',
      userMessage: 'Session expired',
      isRetryable: false,
      errorCode: 'AUTH_ERROR',
      actions: [
        ErrorAction(
          label: 'Login',
          action: () => _navigateToLogin(),
        ),
      ],
    );
  }
  
  static ErrorResult _handleServerError(ServerException error) {
    return ErrorResult(
      message: 'Server is temporarily unavailable. Please try again later.',
      userMessage: 'Server error',
      isRetryable: true,
      errorCode: 'SERVER_ERROR',
      actions: [
        ErrorAction(
          label: 'Retry',
          action: () {},
        ),
      ],
    );
  }
  
  static ErrorResult _handlePlatformError(PlatformException error) {
    return ErrorResult(
      message: error.message ?? 'A platform error occurred',
      userMessage: 'System error',
      isRetryable: false,
      errorCode: error.code,
      actions: [],
    );
  }
  
  static ErrorResult _handleFormatError(FormatException error) {
    return ErrorResult(
      message: 'Invalid data format received',
      userMessage: 'Data error',
      isRetryable: false,
      errorCode: 'FORMAT_ERROR',
      actions: [],
    );
  }
  
  static ErrorResult _handleTypeError(TypeError error) {
    return ErrorResult(
      message: 'Unexpected data type encountered',
      userMessage: 'Processing error',
      isRetryable: false,
      errorCode: 'TYPE_ERROR',
      actions: [],
    );
  }
  
  static ErrorResult _handleUnknownError(dynamic error) {
    return ErrorResult(
      message: error.toString(),
      userMessage: 'An unexpected error occurred',
      isRetryable: true,
      errorCode: 'UNKNOWN_ERROR',
      actions: [
        ErrorAction(
          label: 'Retry',
          action: () {},
        ),
      ],
    );
  }
  
  // UI feedback
  static void _showErrorUI(BuildContext context, ErrorResult result) {
    if (result.severity == ErrorSeverity.critical) {
      _showErrorDialog(context, result);
    } else {
      _showErrorSnackBar(context, result);
    }
  }
  
  static void _showErrorDialog(BuildContext context, ErrorResult result) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(result.userMessage),
        content: Text(result.message),
        actions: [
          ...result.actions.map(
            (action) => TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                action.action();
              },
              child: Text(action.label),
            ),
          ),
          if (result.actions.isEmpty)
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
        ],
      ),
    );
  }
  
  static void _showErrorSnackBar(BuildContext context, ErrorResult result) {
    final snackBar = SnackBar(
      content: Text(result.userMessage),
      duration: const Duration(seconds: 4),
      backgroundColor: _getSeverityColor(result.severity),
      action: result.actions.isNotEmpty
          ? SnackBarAction(
              label: result.actions.first.label,
              onPressed: result.actions.first.action,
            )
          : null,
    );
    
    ScaffoldMessenger.of(context).showSnackBar(snackBar);
  }
  
  static Color _getSeverityColor(ErrorSeverity severity) {
    switch (severity) {
      case ErrorSeverity.low:
        return Colors.grey;
      case ErrorSeverity.medium:
        return Colors.orange;
      case ErrorSeverity.high:
        return Colors.deepOrange;
      case ErrorSeverity.critical:
        return Colors.red;
    }
  }
  
  // Helper methods
  static void _openNetworkSettings() {
    // Platform-specific implementation
  }
  
  static void _navigateToLogin() {
    // Navigation to login page
  }
}

// Error result model
class ErrorResult {
  final String message;
  final String userMessage;
  final bool isRetryable;
  final String errorCode;
  final List<ErrorAction> actions;
  final ErrorSeverity severity;
  final Map<String, dynamic>? metadata;
  
  ErrorResult({
    required this.message,
    required this.userMessage,
    required this.isRetryable,
    required this.errorCode,
    this.actions = const [],
    this.severity = ErrorSeverity.medium,
    this.metadata,
  });
}

// Error action model
class ErrorAction {
  final String label;
  final VoidCallback action;
  
  ErrorAction({
    required this.label,
    required this.action,
  });
}

// Error severity levels
enum ErrorSeverity {
  low,
  medium,
  high,
  critical,
}

// Type definitions
typedef ErrorHandlerCallback<T> = ErrorResult Function(T error);
typedef GlobalErrorCallback = void Function(dynamic error, ErrorResult result);

// Error boundary widget
class ErrorBoundary extends StatefulWidget {
  final Widget child;
  final Widget Function(Object error, StackTrace? stack)? errorBuilder;
  final void Function(Object error, StackTrace? stack)? onError;
  
  const ErrorBoundary({
    super.key,
    required this.child,
    this.errorBuilder,
    this.onError,
  });
  
  @override
  State<ErrorBoundary> createState() => _ErrorBoundaryState();
}

class _ErrorBoundaryState extends State<ErrorBoundary> {
  Object? _error;
  StackTrace? _stackTrace;
  
  @override
  void initState() {
    super.initState();
    _setupErrorBoundary();
  }
  
  void _setupErrorBoundary() {
    FlutterError.onError = (FlutterErrorDetails details) {
      setState(() {
        _error = details.exception;
        _stackTrace = details.stack;
      });
      
      widget.onError?.call(details.exception, details.stack);
      ErrorHandler.handle(
        details.exception,
        stackTrace: details.stack,
        context: context,
      );
    };
  }
  
  void _resetError() {
    setState(() {
      _error = null;
      _stackTrace = null;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return widget.errorBuilder?.call(_error!, _stackTrace) ??
          _buildDefaultErrorWidget();
    }
    
    return widget.child;
  }
  
  Widget _buildDefaultErrorWidget() {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red,
              ),
              const SizedBox(height: 16),
              const Text(
                'Something went wrong',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                _error.toString(),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _resetError,
                child: const Text('Try Again'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}