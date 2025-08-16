import 'package:flutter/material.dart';

/// 번개 아이콘 위젯
/// assets/icon.png 이미지를 사용하는 공통 위젯
/// 원본 그래디언트 색상을 그대로 표시
class SparkIcon extends StatelessWidget {
  final double size;
  
  const SparkIcon({
    super.key,
    this.size = 24,
  });
  
  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/icon.png',
      width: size,
      height: size,
      fit: BoxFit.contain,
    );
  }
}