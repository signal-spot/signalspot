import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/api_constants.dart';

final websocketServiceProvider = Provider<WebSocketService>((ref) {
  return WebSocketService();
});

class WebSocketService extends ChangeNotifier {
  IO.Socket? _socket;
  bool _isConnected = false;
  final Map<String, List<Function>> _eventHandlers = {};

  bool get isConnected => _isConnected;
  IO.Socket? get socket => _socket;

  void connect(String token) {
    if (_socket != null && _socket!.connected) {
      debugPrint('WebSocket already connected');
      return;
    }

    // WebSocket URL을 환경 변수에서 가져오기
    final wsUrl = ApiConstants.wsUrl;
    final wsPath = ApiConstants.wsPath;
    debugPrint('Connecting to WebSocket at $wsUrl with path: $wsPath');

    _socket = IO.io(
      wsUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setPath(wsPath)
          .setAuth({'token': token})
          .setQuery({'token': token})
          .enableAutoConnect()
          .enableForceNew()
          .build(),
    );

    _setupEventListeners();
  }

  void _setupEventListeners() {
    if (_socket == null) return;

    _socket!.onConnect((_) {
      debugPrint('WebSocket connected');
      _isConnected = true;
      notifyListeners();
      _emitEvent('connected', null);
    });

    _socket!.onDisconnect((_) {
      debugPrint('WebSocket disconnected');
      _isConnected = false;
      notifyListeners();
      _emitEvent('disconnected', null);
    });

    _socket!.onError((error) {
      debugPrint('WebSocket error: $error');
      _emitEvent('error', error);
    });
    
    // Debug: Listen for ANY event to see what the server is sending
    _socket!.onAny((event, data) {
      debugPrint('🌐 WebSocket ANY Event: $event');
      debugPrint('📦 Event data: $data');
    });

    // Listen for new messages in chat rooms
    _socket!.on('messageReceived', (data) {
      debugPrint('🔔 WebSocket Event: messageReceived');
      debugPrint('📨 Message data: $data');
      _emitEvent('messageReceived', data);
    });
    
    // Also support legacy event name for backward compatibility
    _socket!.on('newMessage', (data) {
      debugPrint('🔔 WebSocket Event: newMessage (legacy)');
      debugPrint('📨 Message data: $data');
      _emitEvent('messageReceived', data);
    });
    
    // Listen for chat message event (another possible event name)
    _socket!.on('chatMessage', (data) {
      debugPrint('🔔 WebSocket Event: chatMessage');
      debugPrint('📨 Message data: $data');
      _emitEvent('messageReceived', data);
    });
    
    // Listen for message event (generic)
    _socket!.on('message', (data) {
      debugPrint('🔔 WebSocket Event: message');
      debugPrint('📨 Message data: $data');
      _emitEvent('messageReceived', data);
    });

    // Listen for typing indicators
    _socket!.on('userTyping', (data) {
      debugPrint('User typing: $data');
      _emitEvent('userTyping', data);
    });

    // Listen for connection confirmation
    _socket!.on('connected', (data) {
      debugPrint('Connection confirmed: $data');
      _emitEvent('connectionConfirmed', data);
    });

    // Listen for spot updates
    _socket!.on('spotUpdate', (data) {
      debugPrint('Spot update: $data');
      _emitEvent('spotUpdate', data);
    });

    // Listen for location updates
    _socket!.on('locationUpdate', (data) {
      debugPrint('Location update: $data');
      _emitEvent('locationUpdate', data);
    });
  }

  void subscribeToChatRoom(String roomId) {
    if (_socket == null || !_socket!.connected) {
      debugPrint('Cannot subscribe to chat room: WebSocket not connected');
      return;
    }

    debugPrint('Subscribing to chat room: $roomId');
    _socket!.emit('subscribeToChatRoom', {'roomId': roomId});
  }

  void unsubscribeFromChatRoom(String roomId) {
    if (_socket == null || !_socket!.connected) return;

    debugPrint('Unsubscribing from chat room: $roomId');
    _socket!.emit('unsubscribe', {'room': 'chat:$roomId'});
  }

  void subscribeToLocation(double latitude, double longitude, double radiusKm) {
    if (_socket == null || !_socket!.connected) {
      debugPrint('Cannot subscribe to location: WebSocket not connected');
      return;
    }

    debugPrint('Subscribing to location: $latitude, $longitude');
    _socket!.emit('subscribeToLocation', {
      'latitude': latitude,
      'longitude': longitude,
      'radiusKm': radiusKm,
    });
  }

  void subscribeToSpot(String spotId) {
    if (_socket == null || !_socket!.connected) {
      debugPrint('Cannot subscribe to spot: WebSocket not connected');
      return;
    }

    debugPrint('Subscribing to spot: $spotId');
    _socket!.emit('subscribeToSpot', {'spotId': spotId});
  }

  void sendTypingIndicator(String roomId, bool isTyping) {
    if (_socket == null || !_socket!.connected) return;

    _socket!.emit('typing', {
      'roomId': roomId,
      'isTyping': isTyping,
    });
  }

  void addEventListener(String event, Function handler) {
    if (!_eventHandlers.containsKey(event)) {
      _eventHandlers[event] = [];
    }
    _eventHandlers[event]!.add(handler);
  }

  void removeEventListener(String event, Function handler) {
    if (_eventHandlers.containsKey(event)) {
      _eventHandlers[event]!.remove(handler);
      // 리스트가 비어있으면 키도 제거
      if (_eventHandlers[event]!.isEmpty) {
        _eventHandlers.remove(event);
      }
    }
  }

  void _emitEvent(String event, dynamic data) {
    if (_eventHandlers.containsKey(event)) {
      // 리스트 복사본을 만들어서 iterate 중 수정되는 것을 방지
      final handlers = List<Function>.from(_eventHandlers[event]!);
      for (var handler in handlers) {
        try {
          handler(data);
        } catch (e) {
          debugPrint('Error calling event handler for $event: $e');
        }
      }
    }
  }

  void disconnect() {
    if (_socket != null) {
      _socket!.disconnect();
      _socket!.dispose();
      _socket = null;
      _isConnected = false;
      notifyListeners();
    }
  }

  @override
  void dispose() {
    disconnect();
    super.dispose();
  }
}