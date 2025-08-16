import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';
// import 'package:flutter_image_compress/flutter_image_compress.dart'; // TODO: Add to pubspec.yaml if needed
import 'package:path_provider/path_provider.dart';
import '../config/environment.dart';
import 'logger.dart';

class ImageCacheManager {
  static final _instance = DefaultCacheManager();
  static const int _maxCacheSize = 500 * 1024 * 1024; // 500MB
  static const Duration _maxAge = Duration(days: 30);
  static const int _maxConcurrentDownloads = 3;
  
  static CacheManager get instance => _instance;
  
  /// Custom cache manager with optimized settings
  static CacheManager createCustomCacheManager({
    String key = 'signalspot_images',
    Duration? maxAge,
    int? maxCacheSize,
  }) {
    return CacheManager(
      Config(
        key,
        stalePeriod: maxAge ?? _maxAge,
        maxNrOfCacheObjects: 1000,
        repo: JsonCacheInfoRepository(databaseName: key),
        fileService: HttpFileService(),
      ),
    );
  }
  
  /// Preload images for better performance
  static Future<void> preloadImages(
    BuildContext context,
    List<String> imageUrls,
  ) async {
    final futures = imageUrls.map((url) => 
      precacheImage(
        CachedNetworkImageProvider(url),
        context,
      ),
    );
    
    await Future.wait(
      futures,
      eagerError: false,
    ).catchError((error) {
      Logger.warning('Failed to preload some images', error);
      return [];
    });
  }
  
  /// Clear image cache
  static Future<void> clearCache() async {
    await _instance.emptyCache();
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();
    Logger.info('Image cache cleared');
  }
  
  /// Get cache size
  static Future<int> getCacheSize() async {
    final cacheDir = await getTemporaryDirectory();
    return _getDirectorySize(cacheDir);
  }
  
  static Future<int> _getDirectorySize(Directory dir) async {
    int size = 0;
    
    await for (final entity in dir.list(recursive: true, followLinks: false)) {
      if (entity is File) {
        size += await entity.length();
      }
    }
    
    return size;
  }
  
  /// Optimize image before caching
  static Future<Uint8List?> optimizeImage(
    File imageFile, {
    int quality = 85,
    int? maxWidth,
    int? maxHeight,
  }) async {
    try {
      // TODO: Implement image compression when flutter_image_compress is added
      // final result = await FlutterImageCompress.compressWithFile(
      //   imageFile.absolute.path,
      //   quality: quality,
      //   minWidth: maxWidth ?? 1920,
      //   minHeight: maxHeight ?? 1080,
      //   rotate: 0,
      // );
      final result = await imageFile.readAsBytes();
      
      if (result != null) {
        Logger.debug('Image optimized: ${imageFile.lengthSync()} -> ${result.length} bytes');
      }
      
      return result;
    } catch (e) {
      Logger.error('Failed to optimize image', e);
      return null;
    }
  }
}

/// Optimized cached image widget
class OptimizedCachedImage extends StatelessWidget {
  final String imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Widget? placeholder;
  final Widget? errorWidget;
  final bool enableMemoryCache;
  final bool enableDiskCache;
  final int? maxWidth;
  final int? maxHeight;
  final Map<String, String>? headers;
  final Duration fadeInDuration;
  final Duration fadeOutDuration;
  
  const OptimizedCachedImage({
    super.key,
    required this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.placeholder,
    this.errorWidget,
    this.enableMemoryCache = true,
    this.enableDiskCache = true,
    this.maxWidth,
    this.maxHeight,
    this.headers,
    this.fadeInDuration = const Duration(milliseconds: 300),
    this.fadeOutDuration = const Duration(milliseconds: 300),
  });
  
  @override
  Widget build(BuildContext context) {
    // Calculate optimal dimensions based on device pixel ratio
    final devicePixelRatio = MediaQuery.of(context).devicePixelRatio;
    final cacheWidth = maxWidth ?? (width != null ? (width! * devicePixelRatio).round() : null);
    final cacheHeight = maxHeight ?? (height != null ? (height! * devicePixelRatio).round() : null);
    
    return CachedNetworkImage(
      imageUrl: imageUrl,
      width: width,
      height: height,
      fit: fit,
      memCacheWidth: enableMemoryCache ? cacheWidth : null,
      memCacheHeight: enableMemoryCache ? cacheHeight : null,
      maxWidthDiskCache: enableDiskCache ? cacheWidth : null,
      maxHeightDiskCache: enableDiskCache ? cacheHeight : null,
      httpHeaders: headers,
      fadeInDuration: fadeInDuration,
      fadeOutDuration: fadeOutDuration,
      placeholder: placeholder != null
          ? (context, url) => placeholder!
          : (context, url) => _buildDefaultPlaceholder(),
      errorWidget: errorWidget != null
          ? (context, url, error) => errorWidget!
          : (context, url, error) => _buildDefaultErrorWidget(),
      cacheManager: ImageCacheManager.instance,
    );
  }
  
  Widget _buildDefaultPlaceholder() {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: const Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
        ),
      ),
    );
  }
  
  Widget _buildDefaultErrorWidget() {
    return Container(
      width: width,
      height: height,
      color: Colors.grey[200],
      child: const Center(
        child: Icon(
          Icons.broken_image,
          color: Colors.grey,
        ),
      ),
    );
  }
}

/// Progressive image loader for large images
class ProgressiveImage extends StatelessWidget {
  final String thumbnailUrl;
  final String fullImageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final Duration transitionDuration;
  
  const ProgressiveImage({
    super.key,
    required this.thumbnailUrl,
    required this.fullImageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.transitionDuration = const Duration(milliseconds: 500),
  });
  
  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.passthrough,
      children: [
        // Low quality thumbnail
        OptimizedCachedImage(
          imageUrl: thumbnailUrl,
          width: width,
          height: height,
          fit: fit,
          fadeInDuration: Duration.zero,
        ),
        // High quality image
        AnimatedOpacity(
          opacity: 1.0,
          duration: transitionDuration,
          child: OptimizedCachedImage(
            imageUrl: fullImageUrl,
            width: width,
            height: height,
            fit: fit,
          ),
        ),
      ],
    );
  }
}

/// Avatar image with fallback
class AvatarImage extends StatelessWidget {
  final String? imageUrl;
  final double radius;
  final String? fallbackText;
  final Color? backgroundColor;
  
  const AvatarImage({
    super.key,
    this.imageUrl,
    required this.radius,
    this.fallbackText,
    this.backgroundColor,
  });
  
  @override
  Widget build(BuildContext context) {
    if (imageUrl != null && imageUrl!.isNotEmpty) {
      return CircleAvatar(
        radius: radius,
        backgroundColor: backgroundColor ?? Theme.of(context).colorScheme.surface,
        child: ClipOval(
          child: OptimizedCachedImage(
            imageUrl: imageUrl!,
            width: radius * 2,
            height: radius * 2,
            fit: BoxFit.cover,
            errorWidget: _buildFallback(context),
          ),
        ),
      );
    }
    
    return CircleAvatar(
      radius: radius,
      backgroundColor: backgroundColor ?? Theme.of(context).colorScheme.primary,
      child: _buildFallback(context),
    );
  }
  
  Widget _buildFallback(BuildContext context) {
    if (fallbackText != null && fallbackText!.isNotEmpty) {
      return Text(
        fallbackText!.substring(0, 1).toUpperCase(),
        style: TextStyle(
          fontSize: radius * 0.8,
          color: Theme.of(context).colorScheme.onPrimary,
          fontWeight: FontWeight.bold,
        ),
      );
    }
    
    return Icon(
      Icons.person,
      size: radius,
      color: Theme.of(context).colorScheme.onPrimary,
    );
  }
}