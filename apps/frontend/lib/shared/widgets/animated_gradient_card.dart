import 'package:flutter/material.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';

class AnimatedGradientCard extends StatefulWidget {
  final Widget child;
  final List<Color> gradientColors;
  final VoidCallback? onTap;
  final double? height;
  final double? width;
  final EdgeInsetsGeometry? padding;
  final BorderRadius? borderRadius;
  
  const AnimatedGradientCard({
    super.key,
    required this.child,
    required this.gradientColors,
    this.onTap,
    this.height,
    this.width,
    this.padding,
    this.borderRadius,
  });

  @override
  State<AnimatedGradientCard> createState() => _AnimatedGradientCardState();
}

class _AnimatedGradientCardState extends State<AnimatedGradientCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap,
      child: AnimatedBuilder(
        animation: _animation,
        builder: (context, child) {
          return Container(
            height: widget.height,
            width: widget.width,
            padding: widget.padding ?? const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment(-1 - _animation.value, -1),
                end: Alignment(1 + _animation.value, 1),
                colors: widget.gradientColors,
              ),
              borderRadius: widget.borderRadius ?? 
                BorderRadius.circular(AppSpacing.borderRadiusLg),
              boxShadow: [
                BoxShadow(
                  color: widget.gradientColors.first.withValues(alpha: 0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: widget.child,
          );
        },
      ),
    );
  }
}

// 스켈레톤 로딩 카드
class SkeletonCard extends StatefulWidget {
  final double? height;
  final double? width;
  final BorderRadius? borderRadius;
  
  const SkeletonCard({
    super.key,
    this.height,
    this.width,
    this.borderRadius,
  });

  @override
  State<SkeletonCard> createState() => _SkeletonCardState();
}

class _SkeletonCardState extends State<SkeletonCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 1),
      vsync: this,
    );
    _animation = Tween<double>(
      begin: 0.3,
      end: 0.6,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    _controller.repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          height: widget.height ?? 100,
          width: widget.width,
          decoration: BoxDecoration(
            color: AppColors.grey200.withValues(alpha: _animation.value),
            borderRadius: widget.borderRadius ??
                BorderRadius.circular(AppSpacing.borderRadiusMd),
          ),
        );
      },
    );
  }
}

// 펄스 애니메이션 위젯
class PulseAnimationWidget extends StatefulWidget {
  final Widget child;
  final Color pulseColor;
  final double size;
  
  const PulseAnimationWidget({
    super.key,
    required this.child,
    required this.pulseColor,
    this.size = 100,
  });

  @override
  State<PulseAnimationWidget> createState() => _PulseAnimationWidgetState();
}

class _PulseAnimationWidgetState extends State<PulseAnimationWidget>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    
    _opacityAnimation = Tween<double>(
      begin: 0.5,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    ));
    
    _controller.repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      alignment: Alignment.center,
      children: [
        // 펄스 효과
        AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            return Transform.scale(
              scale: _scaleAnimation.value,
              child: Container(
                width: widget.size,
                height: widget.size,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.pulseColor.withValues(alpha: _opacityAnimation.value),
                ),
              ),
            );
          },
        ),
        // 중앙 콘텐츠
        widget.child,
      ],
    );
  }
}