import 'dart:async';
import 'dart:typed_data';
import 'dart:io' show Platform;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:go_router/go_router.dart';
import 'dart:ui' as ui;
import '../../../../shared/providers/signal_provider.dart';
import '../../../../shared/providers/location_provider.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/models/index.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/theme/app_text_styles.dart';

// 임시 MapNote 클래스 정의
class MapNote {
  final String id;
  final LatLng position;
  final String title;
  final String content;
  final String author;
  final String timeAgo;
  final int reactions;
  final String distance;

  MapNote({
    required this.id,
    required this.position,
    required this.title,
    required this.content,
    required this.author,
    required this.timeAgo,
    required this.reactions,
    required this.distance,
  });
}

class MapPage extends ConsumerStatefulWidget {
  const MapPage({super.key});

  @override
  ConsumerState<MapPage> createState() => _MapPageState();
}

class _MapPageState extends ConsumerState<MapPage> with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;
  GoogleMapController? _mapController;
  LatLng? _currentPosition; // null로 시작하여 실제 위치를 받을 때까지 대기
  bool _isLoadingLocation = true; // 처음부터 로딩 상태로 시작
  BitmapDescriptor? _noteMarkerIcon;
  BitmapDescriptor? _currentLocationIcon;
  final TextEditingController _commentController = TextEditingController();
  final FocusNode _commentFocusNode = FocusNode();
  DateTime? _lastMapUpdate;
  Timer? _mapUpdateDebouncer;
  LatLng? _lastLoadedPosition;
  bool _isInitialLoadComplete = false; // 초기 로드 완료 플래그
  Set<Marker> _cachedMarkers = {}; // 마커 캐시



  @override
  void initState() {
    super.initState();
    print('🗺️ MapPage: initState() - Google Maps 초기화');
    _createCustomMarkers(); // 마커 아이콘만 생성
    
    // 앱 시작 시 바로 실제 위치 가져오기
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialData();
    });
  }
  
  Widget _buildHeader() {
    final timeBasedGradient = ref.watch(timeBasedGradientProvider);
    return Container(
      decoration: BoxDecoration(
        gradient: timeBasedGradient,
      ),
      child: SafeArea(
        bottom: false,
        child: Container(
          height: 100,
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.md,
            AppSpacing.lg,
            AppSpacing.md,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    '내 주변 Signal Spot',
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '지도를 탐색하고 새 쪽지를 남겨보세요',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
              Row(
                children: [
                  GestureDetector(
                    onTap: () async {
                      if (_currentPosition == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content: Text('위치를 가져오는 중입니다...'),
                            duration: Duration(seconds: 1),
                          ),
                        );
                        return;
                      }
                      
                      // Signal Spot 새로고침
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('지도를 새로고침하는 중...'),
                          duration: Duration(seconds: 1),
                        ),
                      );
                      
                      // 캐시를 무시하고 강제로 새로 로드
                      await ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
                        latitude: _currentPosition!.latitude,
                        longitude: _currentPosition!.longitude,
                        radiusKm: 50.0,
                      );
                      
                      // 마커 업데이트 (디바운싱 처리됨)
                      _updateMarkers();
                      
                      final nearbySpots = ref.read(nearbySignalSpotsProvider);
                      if (nearbySpots.hasValue && nearbySpots.value != null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('${nearbySpots.value!.data.length}개의 Signal Spot을 찾았습니다'),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(
                          AppSpacing.borderRadiusMd,
                        ),
                      ),
                      child: const Icon(
                        Icons.refresh,
                        color: AppColors.white,
                        size: AppSpacing.iconMd,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  GestureDetector(
                    onTap: () {
                      if (_currentPosition != null && _mapController != null && !_isLoadingLocation) {
                        _mapController!.animateCamera(
                          CameraUpdate.newCameraPosition(
                            CameraPosition(
                              target: _currentPosition!,
                              zoom: 15.0,
                            ),
                          ),
                        );
                      } else {
                        _getCurrentLocation();
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(
                          AppSpacing.borderRadiusMd,
                        ),
                      ),
                      child: const Icon(
                        Icons.my_location,
                        color: AppColors.white,
                        size: AppSpacing.iconMd,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _loadInitialData() async {
    // 이미 초기 로드가 완료되었으면 스킵
    if (_isInitialLoadComplete) return;
    
    // 초기 로드 시작 표시 (무한 반복 방지)
    _isInitialLoadComplete = true;
    
    try {
      print('════════════════════════════════════════════');
      print('🚀 _loadInitialData() 시작');
      
      // 먼저 실제 위치를 가져옴
      await _getCurrentLocation();
      
      // 위치가 설정되었는지 확인
      if (_currentPosition == null) {
        print('   - ⚠️ 현재 위치가 아직 설정되지 않음');
        return;
      }
      
      print('   - 현재 위치: ${_currentPosition!.latitude}, ${_currentPosition!.longitude}');
      print('   - Signal Spot 로드 시작 (반경 50km)...');
      
      // 주변 Signal Spot 로드 (현재 위치 기준)
      await ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
        latitude: _currentPosition!.latitude,
        longitude: _currentPosition!.longitude,
        radiusKm: 50.0,  // 서울 전체 및 수도권을 커버하기 위해 반경 증가
      );
      
      // 로드 후 상태 확인
      final nearbySpots = ref.read(nearbySignalSpotsProvider);
      print('   - 로드 결과:');
      if (nearbySpots.hasValue && nearbySpots.value != null) {
        print('     ✅ 성공: ${nearbySpots.value!.data.length}개 Signal Spot');
        for (var i = 0; i < nearbySpots.value!.data.length && i < 5; i++) {
          final spot = nearbySpots.value!.data[i];
          print('       ${i+1}. ${spot.title} at (${spot.latitude}, ${spot.longitude})');
        }
        if (nearbySpots.value!.data.length > 5) {
          print('       ... 외 ${nearbySpots.value!.data.length - 5}개');
        }
        
        // 마커 업데이트 한 번만 실행
        if (mounted) {
          print('   - 마커 업데이트 호출...');
          _updateMarkers();
        }
      } else if (nearbySpots.hasError) {
        print('     ❌ 오류: ${nearbySpots.error}');
      } else {
        print('     ⏳ 로딩 중...');
      }
      print('════════════════════════════════════════════');
    } catch (e, stack) {
      print('❌ 초기 데이터 로드 실패:');
      print('   - Error: $e');
      print('   - Stack: $stack');
    }
  }

  // 커스텀 마커 아이콘 생성
  Future<void> _createCustomMarkers() async {
    try {
      // 쪽지 모양 아이콘 생성
      _noteMarkerIcon = await _createNoteIcon();
      // 현재 위치 아이콘 생성  
      _currentLocationIcon = await _createCurrentLocationIcon();
      print('🗺️ 커스텀 마커 아이콘 생성 완료');
      
      // 마커 생성 후에는 업데이트하지 않음 (초기 로드에서 처리)
    } catch (e) {
      print('❌ 커스텀 마커 생성 실패: $e');
      // 실패 시 기본 아이콘 사용
      _noteMarkerIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet);
      _currentLocationIcon = BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueRed);
    }
  }

  // 쪽지 모양 아이콘 생성
  Future<BitmapDescriptor> _createNoteIcon() async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    final size = 100.0; // 크기 줄임
    
    // 쪽지 모양의 배경
    final backgroundPaint = Paint()
      ..color = const Color(0xFF6750A4)
      ..style = PaintingStyle.fill;
    
    final borderPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;
    
    // 쪽지 본체 (종이 모양)
    final paperPath = Path();
    paperPath.moveTo(10, 10);
    paperPath.lineTo(size - 10, 10);
    paperPath.lineTo(size - 10, size - 30);
    paperPath.lineTo(size / 2 + 8, size - 30);
    paperPath.lineTo(size / 2, size - 10); // 뾰족한 끝
    paperPath.lineTo(size / 2 - 8, size - 30);
    paperPath.lineTo(10, size - 30);
    paperPath.close();
    
    // 그림자 효과
    final shadowPaint = Paint()
      ..color = Colors.black.withOpacity(0.2)
      ..style = PaintingStyle.fill
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
    
    // 그림자 그리기
    canvas.save();
    canvas.translate(2, 2);
    canvas.drawPath(paperPath, shadowPaint);
    canvas.restore();
    
    // 배경 그리기
    canvas.drawPath(paperPath, backgroundPaint);
    canvas.drawPath(paperPath, borderPaint);
    
    // 쪽지 안의 라인들 (메시지 표시)
    final linePaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;
    
    // 메시지 라인들
    canvas.drawLine(
      Offset(25, 30),
      Offset(size - 25, 30),
      linePaint,
    );
    canvas.drawLine(
      Offset(25, 45),
      Offset(size - 35, 45),
      linePaint,
    );
    canvas.drawLine(
      Offset(25, 60),
      Offset(size - 30, 60),
      linePaint,
    );
    
    final picture = recorder.endRecording();
    final img = await picture.toImage(size.toInt(), size.toInt());
    final bytes = await img.toByteData(format: ui.ImageByteFormat.png);
    
    return BitmapDescriptor.fromBytes(bytes!.buffer.asUint8List());
  }

  // 현재 위치 아이콘 생성
  Future<BitmapDescriptor> _createCurrentLocationIcon() async {
    final recorder = ui.PictureRecorder();
    final canvas = Canvas(recorder);
    final size = 100.0;
    
    // 외부 원 (흰색 테두리)
    final outerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(size / 2, size / 2), size / 2, outerPaint);
    
    // 내부 원 (파란색)
    final innerPaint = Paint()
      ..color = const Color(0xFF2196F3)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(size / 2, size / 2), size / 2 - 8, innerPaint);
    
    // 중심점 (흰색)
    final centerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(size / 2, size / 2), 12, centerPaint);
    
    final picture = recorder.endRecording();
    final img = await picture.toImage(size.toInt(), size.toInt());
    final bytes = await img.toByteData(format: ui.ImageByteFormat.png);
    
    return BitmapDescriptor.fromBytes(bytes!.buffer.asUint8List());
  }

  Future<void> _getCurrentLocation() async {
    setState(() => _isLoadingLocation = true);
    
    try {
      // GPS 위치 가져오기 시도
      await ref.read(currentPositionProvider.notifier).getCurrentPosition();
      final positionState = ref.read(currentPositionProvider);
      
      print('📍 CurrentPositionProvider 결과: $positionState');
      
      if (!mounted) return;
      
      if (positionState.hasValue && positionState.value != null) {
        // 위치를 성공적으로 가져옴
        final position = positionState.value!;
        setState(() {
          _currentPosition = LatLng(position.latitude, position.longitude);
          _isLoadingLocation = false;
        });

        print('✅ 현재 위치 설정 완료: ${_currentPosition!.latitude}, ${_currentPosition!.longitude}');

        // 현재 위치 기준으로 Signal Spot 로드
        await ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
          latitude: position.latitude,
          longitude: position.longitude,
          radiusKm: 50.0,
        );

        _updateMarkers();

        // 지도를 현재 위치로 이동
        if (_mapController != null) {
          try {
            await _mapController!.animateCamera(
              CameraUpdate.newCameraPosition(
                CameraPosition(
                  target: _currentPosition!,
                  zoom: 15.0,
                ),
              ),
            );
          } catch (e) {
            print('⚠️ 카메라 이동 실패 (무시): $e');
          }
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('현재 위치: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}'),
            duration: const Duration(seconds: 2),
          ),
        );
      } else {
        // 위치를 가져올 수 없으면 서울시청 사용
        print('❌ 위치를 가져올 수 없음 - 서울시청 위치 사용');
        setState(() {
          _currentPosition = const LatLng(37.5665, 126.9780);
          _isLoadingLocation = false;
        });
        
        // 서울시청 기준으로 Signal Spot 로드
        await ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
          latitude: 37.5665,
          longitude: 126.9780,
          radiusKm: 50.0,
        );
        
        _updateMarkers();
        
        // 지도를 서울시청으로 이동
        if (_mapController != null) {
          try {
            await _mapController!.animateCamera(
              CameraUpdate.newCameraPosition(
                CameraPosition(
                  target: _currentPosition!,
                  zoom: 15.0,
                ),
              ),
            );
          } catch (e) {
            print('⚠️ 카메라 이동 실패 (무시): $e');
          }
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('위치를 가져올 수 없어 서울시청 위치를 사용합니다'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      print('❌ 위치 가져오기 실패: $e - 서울시청 위치 사용');
      if (mounted) {
        setState(() {
          _currentPosition = const LatLng(37.5665, 126.9780);
          _isLoadingLocation = false;
        });
        
        // 서울시청 기준으로 Signal Spot 로드
        await ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
          latitude: 37.5665,
          longitude: 126.9780,
          radiusKm: 50.0,
        );
        
        _updateMarkers();
        
        // 지도를 서울시청으로 이동
        if (_mapController != null) {
          try {
            await _mapController!.animateCamera(
              CameraUpdate.newCameraPosition(
                CameraPosition(
                  target: _currentPosition!,
                  zoom: 15.0,
                ),
              ),
            );
          } catch (e) {
            print('⚠️ 카메라 이동 실패 (무시): $e');
          }
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('위치 오류. 서울시청 위치를 사용합니다'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Set<Marker> _buildMarkers() {
    Set<Marker> newMarkers = {};
    
    print('════════════════════════════════════════════');
    print('🏗️ _buildMarkers 호출됨');
    print('📍 현재 위치: $_currentPosition');
    print('🎨 마커 아이콘 상태:');
    print('   - Note Icon: ${_noteMarkerIcon != null ? "✅ 로드됨" : "❌ null"}');
    print('   - Location Icon: ${_currentLocationIcon != null ? "✅ 로드됨" : "❌ null"}');
    
    // 위치가 없으면 빈 마커 세트 반환
    if (_currentPosition == null) {
      print('⚠️ 현재 위치가 null - 마커 생성 스킵');
      return newMarkers;
    }
    
    // 현재 위치 마커 추가 (아이콘이 null이어도 기본 아이콘 사용)
    final currentLocationMarker = Marker(
      markerId: const MarkerId('current_location'),
      position: _currentPosition!,
      infoWindow: const InfoWindow(
        title: '현재 위치',
        snippet: '여기 계시는군요!',
      ),
      icon: _currentLocationIcon ?? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
      zIndex: 1000, // 현재 위치를 가장 위에 표시
    );
    newMarkers.add(currentLocationMarker);
    print('✅ 현재 위치 마커 추가: ${_currentPosition!.latitude}, ${_currentPosition!.longitude}');

    // Signal Spot 마커들 추가 (read로 변경 - 자동 리빌드 방지)
    final nearbySpots = ref.read(nearbySignalSpotsProvider);
    
    if (nearbySpots.hasValue && nearbySpots.value != null) {
      final response = nearbySpots.value!;
      print('📊 Signal Spot 데이터 상태:');
      print('   - 총 개수: ${response.data.length}개');
      print('   - 성공 여부: ${response.success}');
      print('   - 메시지: ${response.message}');
      
      int addedCount = 0;
      for (final spot in response.data) {
        try {
          print('   ────────────────────');
          print('   📍 Spot #${addedCount + 1}:');
          print('      - ID: ${spot.id}');
          print('      - Title: ${spot.title ?? "제목 없음"}');
          print('      - Position: (${spot.latitude}, ${spot.longitude})');
          // UTF-8 안전한 문자열 자르기
          String safeContent = spot.displayContent;
          if (safeContent.length > 30) {
            // 이모지나 특수문자를 고려한 안전한 substring
            final runes = safeContent.runes.take(30);
            safeContent = String.fromCharCodes(runes);
          }
          print('      - Content: $safeContent...');
          print('      - Status: ${spot.status}');
          print('      - Created: ${spot.createdAt}');
          
          final marker = Marker(
            markerId: MarkerId('spot_${spot.id}'),
            position: LatLng(spot.latitude, spot.longitude),
            infoWindow: InfoWindow(
              title: spot.title ?? 'Signal Spot',
              snippet: '${spot.creatorUsername ?? spot.metadata?['creatorName'] ?? "익명"} · ${_formatTimeAgo(spot.createdAt)}',
              onTap: () => _showSpotDetail(spot),
            ),
            icon: _noteMarkerIcon ?? BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueViolet),
            onTap: () => _showSpotDetail(spot),
            zIndex: 100,
          );
          
          newMarkers.add(marker);
          addedCount++;
          print('      ✅ 마커 생성 성공!');
        } catch (e) {
          print('      ❌ 마커 생성 실패: $e');
        }
      }
      print('   ────────────────────');
      print('   📊 결과: ${addedCount}/${response.data.length}개 마커 생성됨');
    } else if (nearbySpots.hasError) {
      print('❌ Signal Spot 로드 오류:');
      print('   - Error: ${nearbySpots.error}');
      print('   - StackTrace: ${nearbySpots.stackTrace}');
    } else {
      print('⏳ Signal Spot 로딩 중...');
      print('   - isLoading: ${nearbySpots.isLoading}');
      print('   - hasValue: ${nearbySpots.hasValue}');
    }

    print('════════════════════════════════════════════');
    print('📊 최종 마커 통계:');
    print('   - 총 마커 수: ${newMarkers.length}개');
    print('   - 현재 위치 마커: ${newMarkers.any((m) => m.markerId.value == "current_location") ? "✅" : "❌"}');
    print('   - Signal Spot 마커: ${newMarkers.length - 1}개');
    
    // 각 마커 ID 출력
    print('   - 마커 ID 목록:');
    for (var marker in newMarkers) {
      print('      • ${marker.markerId.value}: ${marker.position}');
    }
    print('════════════════════════════════════════════');
    
    return newMarkers;
  }
  
  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return '방금 전';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}분 전';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}시간 전';
    } else {
      return '${difference.inDays}일 전';
    }
  }

  void _showSpotDetail(SignalSpot spot) {
    // 바로 상세 페이지로 이동
    context.push('/map/note/${spot.id}');
  }
  
  // Legacy method for old note display
  void _showNoteDetail(dynamic note) {
    // For backward compatibility - will be removed
    _showSpotDetail(note as SignalSpot);
  }
  
  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required int count,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Row(
          children: [
            Icon(icon, size: 20, color: Colors.grey[700]),
            if (count > 0) ...[
              const SizedBox(width: 4),
              Text(
                count.toString(),
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[700],
                  fontWeight: FontWeight.w500,
                ),
              ),
            ] else ...[
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
  // Legacy methods removed - using SignalSpot API integration now

  // Legacy note detail sheet removed - using modern SignalSpot detail view

  void _onMapTap(LatLng position) {
    print('지도 클릭: ${position.latitude}, ${position.longitude}');
    _showCreateSpotDialog(position);
  }

  void _showCreateSpotDialog(LatLng position) {
    final TextEditingController titleController = TextEditingController();
    final TextEditingController contentController = TextEditingController();
    final TextEditingController tagController = TextEditingController();
    final List<String> tags = [];
    // 익명 선택 기능 제거 - 백엔드에서 닉네임 처리
    
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 드래그 핸들
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(bottom: 20),
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                
                // 헤더
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            const Color(0xFF6750A4),
                            const Color(0xFF6750A4).withOpacity(0.8),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(
                        Icons.edit_note,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '새 Signal Spot 생성',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          '이 위치에 신기한 쪽지를 남겨보세요',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
                
                const SizedBox(height: 24),
                
                // 제목 입력
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: TextField(
                    controller: titleController,
                    style: const TextStyle(fontSize: 16),
                    decoration: InputDecoration(
                      labelText: '제목',
                      labelStyle: TextStyle(color: Colors.grey[600]),
                      prefixIcon: Icon(
                        Icons.title,
                        color: Colors.grey[400],
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(16),
                    ),
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // 내용 입력
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: TextField(
                    controller: contentController,
                    maxLines: 4,
                    style: const TextStyle(fontSize: 16),
                    decoration: InputDecoration(
                      labelText: '내용',
                      labelStyle: TextStyle(color: Colors.grey[600]),
                      prefixIcon: Padding(
                        padding: const EdgeInsets.only(bottom: 60),
                        child: Icon(
                          Icons.message,
                          color: Colors.grey[400],
                        ),
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(16),
                      hintText: '이곳에 무엇이 있나요? 다른 사람들과 공유해주세요!',
                      hintStyle: TextStyle(color: Colors.grey[400]),
                    ),
                  ),
                ),
                
                const SizedBox(height: 20),
                
                // 태그 입력
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TextField(
                        controller: tagController,
                        style: const TextStyle(fontSize: 16),
                        maxLength: 15, // 태그당 최대 15자 제한
                        decoration: InputDecoration(
                          labelText: '태그 추가 (최대 15자)',
                          labelStyle: TextStyle(color: Colors.grey[600]),
                          prefixIcon: Icon(
                            Icons.tag,
                            color: Colors.grey[400],
                          ),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.add, color: Color(0xFF6750A4)),
                            onPressed: () {
                              final trimmedTag = tagController.text.trim();
                              if (trimmedTag.isNotEmpty && 
                                  trimmedTag.length <= 15 &&
                                  tags.length < 10 &&
                                  !tags.contains(trimmedTag.toLowerCase())) {
                                setModalState(() {
                                  tags.add(trimmedTag.toLowerCase());
                                  tagController.clear();
                                });
                              } else if (trimmedTag.length > 15) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('태그는 15자 이내로 입력해주세요'),
                                    duration: Duration(seconds: 2),
                                  ),
                                );
                              } else if (tags.length >= 10) {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('태그는 최대 10개까지 추가할 수 있습니다'),
                                    duration: Duration(seconds: 2),
                                  ),
                                );
                              }
                            },
                          ),
                          border: InputBorder.none,
                          contentPadding: const EdgeInsets.all(16),
                          hintText: '예: 맛집, 카페, 데이트...',
                          hintStyle: TextStyle(color: Colors.grey[400]),
                          counterText: '', // 기본 카운터 텍스트 숨김
                        ),
                        onSubmitted: (value) {
                          final trimmedTag = value.trim();
                          if (trimmedTag.isNotEmpty && 
                              trimmedTag.length <= 15 &&
                              tags.length < 10 &&
                              !tags.contains(trimmedTag.toLowerCase())) {
                            setModalState(() {
                              tags.add(trimmedTag.toLowerCase());
                              tagController.clear();
                            });
                          } else if (trimmedTag.length > 15) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('태그는 15자 이내로 입력해주세요'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          } else if (tags.length >= 10) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text('태그는 최대 10개까지 추가할 수 있습니다'),
                                duration: Duration(seconds: 2),
                              ),
                            );
                          }
                        },
                        onChanged: (value) {
                          // 실시간으로 15자 초과 입력 방지
                          if (value.length > 15) {
                            tagController.text = value.substring(0, 15);
                            tagController.selection = TextSelection.fromPosition(
                              TextPosition(offset: tagController.text.length),
                            );
                          }
                        },
                      ),
                      if (tags.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                          child: Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: tags.map((tag) => Chip(
                              label: Text(tag),
                              deleteIcon: const Icon(Icons.close, size: 18),
                              onDeleted: () {
                                setModalState(() {
                                  tags.remove(tag);
                                });
                              },
                              backgroundColor: const Color(0xFF6750A4).withOpacity(0.1),
                              labelStyle: const TextStyle(
                                color: Color(0xFF6750A4),
                                fontSize: 12,
                              ),
                              deleteIconColor: const Color(0xFF6750A4),
                            )).toList(),
                          ),
                        ),
                    ],
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // 옵션들
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6750A4).withOpacity(0.05),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.location_on,
                            color: const Color(0xFF6750A4),
                            size: 20,
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              '위치: ${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}',
                              style: TextStyle(
                                color: Colors.grey[700],
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ],
                      ),
                      // 익명 선택 UI 제거 - 백엔드에서 닉네임 자동 처리
                    ],
                  ),
                ),
                
                const SizedBox(height: 24),
                
                // 액션 버튼들
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                        ),
                        child: Text(
                          '취소',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ElevatedButton(
                        onPressed: () async {
                          if (titleController.text.isNotEmpty && 
                              contentController.text.isNotEmpty) {
                              try {
                              // Signal Spot 생성 요청
                              final request = CreateSignalSpotRequest(
                                content: contentController.text.trim(),
                                latitude: position.latitude,
                                longitude: position.longitude,
                                title: titleController.text.trim(),
                                mediaUrls: [],
                                tags: tags,
                              );
                              
                              await ref.read(mySignalSpotsProvider.notifier).createSpot(request);
                              
                              print('✅ Signal Spot 생성 완료, 새로고침 시작...');
                              
                              // 생성 후 잠시 대기 (DB 반영 시간)
                              await Future.delayed(const Duration(milliseconds: 500));
                              
                              // 캐시를 무시하고 강제로 새로 로드
                              ref.invalidate(nearbySignalSpotsProvider);
                              
                              // 생성 후 주변 데이터 새로고침
                              await ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
                                latitude: position.latitude,  // 생성한 위치 기준으로 로드
                                longitude: position.longitude,
                                radiusKm: 50.0,  // 반경을 50km로 증가
                              );
                              
                              print('📍 새로고침 완료, 마커 업데이트...');
                              
                              // 마커 업데이트 메서드 명시적 호출
                              if (mounted) {
                                _updateMarkers();
                                print('🔄 _updateMarkers() 호출 완료');
                              }
                            
                            Navigator.pop(context);
                            
                              // 성공 메시지
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Row(
                                    children: const [
                                      Icon(Icons.check_circle, color: Colors.white),
                                      SizedBox(width: 8),
                                      Text('Signal Spot이 성공적으로 생성되었습니다!'),
                                    ],
                                  ),
                                  backgroundColor: AppColors.success,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              );
                            } catch (e) {
                              // 에러 메시지
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text('Signal Spot 생성에 실패했습니다: $e'),
                                  backgroundColor: AppColors.error,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                ),
                              );
                            }
                          } else {
                            // 에러 메시지
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: const Text('제목과 내용을 모두 입력해주세요'),
                                backgroundColor: AppColors.error,
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF6750A4),
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.send, size: 18),
                            SizedBox(width: 8),
                            Text(
                              'Signal Spot 생성',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      )),
    );
  }

  // 지도 카메라 이동 시 새로운 위치에서 마커 로드
  void _onCameraMove(CameraPosition position) {
    print('🔄 카메라 이동 중: ${position.target.latitude}, ${position.target.longitude} (Zoom: ${position.zoom})');
    
    // 디바운서 취소
    _mapUpdateDebouncer?.cancel();
    
    // 500ms 후에 실행
    _mapUpdateDebouncer = Timer(const Duration(milliseconds: 500), () {
      print('⏱️ 디바운스 타이머 실행');
      _loadSpotsAtPosition(position.target);
    });
  }

  // 특정 위치에서 Signal Spot 로드
  Future<void> _loadSpotsAtPosition(LatLng position) async {
    // 이전에 로드한 위치와 거리 계산 (0.01도 = 약 1km)
    if (_lastLoadedPosition != null) {
      final latDiff = (position.latitude - _lastLoadedPosition!.latitude).abs();
      final lngDiff = (position.longitude - _lastLoadedPosition!.longitude).abs();
      
      // 거리가 충분히 멀 때만 새로 로드 (약 2km 이상)
      if (latDiff < 0.02 && lngDiff < 0.02) {
        return;
      }
    }
    
    _lastLoadedPosition = position;
    
    print('📍 새 위치에서 Signal Spot 로드: ${position.latitude}, ${position.longitude}');
    
    try {
      await ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
        latitude: position.latitude,
        longitude: position.longitude,
        radiusKm: 50.0, // 반경 50km로 확대
      );
    } catch (e) {
      print('❌ 위치 기반 Signal Spot 로드 실패: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // AutomaticKeepAliveClientMixin 필수 호출
    
    print('🔄 MapPage build() 호출됨');
    print('   - 현재 위치: $_currentPosition');
    print('   - 로딩 상태: $_isLoadingLocation');
    
    // 위치 로딩 중이거나 위치가 없으면 로딩 화면 표시
    if (_isLoadingLocation || _currentPosition == null) {
      return Scaffold(
        body: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(
                      color: AppColors.primary,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '현재 위치를 가져오는 중...',
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'GPS 신호를 기다리고 있습니다',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    }
    
    // Provider를 listen하지 않고 한 번만 읽기 (자동 리빌드 방지)
    // 데이터 변경은 _updateMarkers()를 통해 수동으로 처리
    if (_cachedMarkers.isEmpty && _noteMarkerIcon != null && _currentLocationIcon != null) {
      // 초기 마커 생성
      _cachedMarkers = _buildMarkers();
    }
    
    // 캐시된 마커 사용
    final currentMarkers = _cachedMarkers;
    
    print('🗺️ GoogleMap 위젯 생성:');
    print('   - 마커 세트 크기: ${currentMarkers.length}');
    print('   - 마커 세트 해시코드: ${currentMarkers.hashCode}');
    print('   - 지도 컨트롤러: ${_mapController != null ? "✅ 있음" : "❌ 없음"}');
    
    return Scaffold(
      body: Column(
        children: [
          // 헤더 (홈 화면과 유사한 스타일)
          _buildHeader(),
          
          // 지도 영역
          Expanded(
            child: GoogleMap(
              onMapCreated: (GoogleMapController controller) {
                print('════════════════════════════════════════════');
                print('🗺️ Google Maps onMapCreated 콜백 호출됨');
                print('   - 컨트롤러 할당 전: ${_mapController != null ? "있음" : "없음"}');
                _mapController = controller;
                print('   - 컨트롤러 할당 후: ${_mapController != null ? "✅ 성공" : "❌ 실패"}');
                print('   - 현재 마커 수: ${currentMarkers.length}');
                print('════════════════════════════════════════════');
                
                // 지도 생성 후 현재 위치로 이동 (위치 재검색 없이)
                Future.delayed(const Duration(milliseconds: 500), () async {
                  if (mounted && _currentPosition != null) {
                    // 안전한 카메라 이동만 수행 (위치 재검색 제거)
                    try {
                      await controller.animateCamera(
                        CameraUpdate.newCameraPosition(
                          CameraPosition(
                            target: _currentPosition!,
                            zoom: 15.0,
                          ),
                        ),
                      );
                    } catch (e) {
                      print('⚠️ 초기 카메라 이동 실패 (무시): $e');
                      // iOS 시뮬레이터에서 발생하는 channel-error 무시
                    }
                  }
                });
              },
              initialCameraPosition: CameraPosition(
                target: _currentPosition!,
                zoom: 15.0,
              ),
              markers: currentMarkers,
              onTap: _onMapTap,
              onCameraMove: _onCameraMove,
              onCameraIdle: () {
                // 카메라 이동이 멈췄을 때 디버깅 정보 출력
                print('════════════════════════════════════════════');
                print('🛑 카메라 정지 (onCameraIdle)');
                print('   - 현재 마커 수: ${currentMarkers.length}');
                print('   - 마커 세트 해시: ${currentMarkers.hashCode}');
                
                if (_mapController != null) {
                  _mapController!.getVisibleRegion().then((bounds) {
                    print('   - 보이는 영역:');
                    print('     • 북동: ${bounds.northeast.latitude}, ${bounds.northeast.longitude}');
                    print('     • 남서: ${bounds.southwest.latitude}, ${bounds.southwest.longitude}');
                  });
                  
                  _mapController!.getZoomLevel().then((zoom) {
                    print('   - 현재 줌 레벨: $zoom');
                  });
                }
                print('════════════════════════════════════════════');
              },
              myLocationEnabled: false, // 커스텀 마커와 충돌 방지
              myLocationButtonEnabled: false,
              mapType: MapType.normal,
              zoomControlsEnabled: false,
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          if (_currentPosition != null) {
            _showCreateSpotDialog(_currentPosition!);
          } else {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('위치를 가져오는 중입니다. 잠시만 기다려주세요.'),
                duration: Duration(seconds: 2),
              ),
            );
          }
        },
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.message, color: Colors.white),
      ),
    );
  }

  void _updateMarkers() {
    if (!mounted) {
      print('⚠️ _updateMarkers 호출됨 - mounted=false, 중단');
      return;
    }
    
    // 아이콘이 준비되지 않았으면 대기
    if (_noteMarkerIcon == null || _currentLocationIcon == null) {
      print('⏳ 마커 아이콘 준비 중...');
      return;
    }
    
    // 디바운싱 처리 - 연속 호출 방지
    _mapUpdateDebouncer?.cancel();
    _mapUpdateDebouncer = Timer(const Duration(milliseconds: 500), () {
      if (!mounted) return;
      
      print('════════════════════════════════════════════');
      print('🔄 _updateMarkers() 디바운싱 후 실행');
      
      final newMarkers = _buildMarkers();
      
      // 마커가 실제로 변경되었을 때만 setState 호출
      if (_cachedMarkers.length != newMarkers.length || 
          !_areMarkersEqual(_cachedMarkers, newMarkers)) {
        print('   - 마커 변경 감지: ${_cachedMarkers.length} -> ${newMarkers.length}');
        setState(() {
          _cachedMarkers = newMarkers;
        });
      } else {
        print('   - 마커 변경 없음, setState 스킵');
      }
      print('════════════════════════════════════════════');
    });
  }
  
  // 마커 세트 비교 헬퍼 함수
  bool _areMarkersEqual(Set<Marker> set1, Set<Marker> set2) {
    if (set1.length != set2.length) return false;
    
    for (final marker in set1) {
      if (!set2.any((m) => m.markerId.value == marker.markerId.value)) {
        return false;
      }
    }
    return true;
  }

  @override
  void dispose() {
    _mapUpdateDebouncer?.cancel();
    _mapController?.dispose();
    _commentController.dispose();
    _commentFocusNode.dispose();
    super.dispose();
  }
}

// Comment model for legacy support
class Comment {
  final String author;
  final String content;
  final String timeAgo;
  int likes;

  Comment({
    required this.author,
    required this.content,
    required this.timeAgo,
    required this.likes,
  });
}