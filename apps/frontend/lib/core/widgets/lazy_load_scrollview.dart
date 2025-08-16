import 'package:flutter/material.dart';
// import 'package:visibility_detector/visibility_detector.dart'; // TODO: Add to pubspec.yaml if needed
import '../utils/logger.dart';

/// Lazy loading scroll view with pagination support
class LazyLoadScrollView extends StatefulWidget {
  final Widget child;
  final Future<void> Function() onEndOfPage;
  final bool isLoading;
  final double scrollThreshold;
  final ScrollController? scrollController;
  final Axis scrollDirection;
  
  const LazyLoadScrollView({
    super.key,
    required this.child,
    required this.onEndOfPage,
    this.isLoading = false,
    this.scrollThreshold = 0.9,
    this.scrollController,
    this.scrollDirection = Axis.vertical,
  });
  
  @override
  State<LazyLoadScrollView> createState() => _LazyLoadScrollViewState();
}

class _LazyLoadScrollViewState extends State<LazyLoadScrollView> {
  late ScrollController _scrollController;
  bool _isLoadingMore = false;
  
  @override
  void initState() {
    super.initState();
    _scrollController = widget.scrollController ?? ScrollController();
    _scrollController.addListener(_onScroll);
  }
  
  @override
  void dispose() {
    if (widget.scrollController == null) {
      _scrollController.dispose();
    }
    super.dispose();
  }
  
  void _onScroll() {
    if (_isLoadingMore || widget.isLoading) return;
    
    final maxScroll = _scrollController.position.maxScrollExtent;
    final currentScroll = _scrollController.position.pixels;
    final threshold = maxScroll * widget.scrollThreshold;
    
    if (currentScroll >= threshold) {
      _loadMore();
    }
  }
  
  Future<void> _loadMore() async {
    if (_isLoadingMore) return;
    
    setState(() {
      _isLoadingMore = true;
    });
    
    try {
      await widget.onEndOfPage();
    } catch (e) {
      Logger.error('Error loading more data', e);
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingMore = false;
        });
      }
    }
  }
  
  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        if (widget.scrollDirection == Axis.vertical)
          SingleChildScrollView(
            controller: _scrollController,
            scrollDirection: widget.scrollDirection,
            child: widget.child,
          )
        else
          SingleChildScrollView(
            controller: _scrollController,
            scrollDirection: widget.scrollDirection,
            child: widget.child,
          ),
        if (_isLoadingMore)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.1),
                      blurRadius: 4,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Paginated list view with automatic loading
class PaginatedListView<T> extends StatefulWidget {
  final Future<List<T>> Function(int page, int pageSize) itemLoader;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final Widget? separatorBuilder;
  final Widget? emptyWidget;
  final Widget? loadingWidget;
  final Widget? errorWidget;
  final int pageSize;
  final EdgeInsetsGeometry? padding;
  final ScrollController? scrollController;
  final bool shrinkWrap;
  final ScrollPhysics? physics;
  
  const PaginatedListView({
    super.key,
    required this.itemLoader,
    required this.itemBuilder,
    this.separatorBuilder,
    this.emptyWidget,
    this.loadingWidget,
    this.errorWidget,
    this.pageSize = 20,
    this.padding,
    this.scrollController,
    this.shrinkWrap = false,
    this.physics,
  });
  
  @override
  State<PaginatedListView<T>> createState() => _PaginatedListViewState<T>();
}

class _PaginatedListViewState<T> extends State<PaginatedListView<T>> {
  final List<T> _items = [];
  int _currentPage = 0;
  bool _isLoading = false;
  bool _hasMore = true;
  String? _error;
  late ScrollController _scrollController;
  
  @override
  void initState() {
    super.initState();
    _scrollController = widget.scrollController ?? ScrollController();
    _loadInitialData();
  }
  
  @override
  void dispose() {
    if (widget.scrollController == null) {
      _scrollController.dispose();
    }
    super.dispose();
  }
  
  Future<void> _loadInitialData() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });
    
    try {
      final items = await widget.itemLoader(0, widget.pageSize);
      
      setState(() {
        _items.clear();
        _items.addAll(items);
        _currentPage = 0;
        _hasMore = items.length >= widget.pageSize;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
      Logger.error('Failed to load initial data', e);
    }
  }
  
  Future<void> _loadMoreData() async {
    if (_isLoading || !_hasMore) return;
    
    setState(() {
      _isLoading = true;
    });
    
    try {
      final nextPage = _currentPage + 1;
      final items = await widget.itemLoader(nextPage, widget.pageSize);
      
      setState(() {
        _items.addAll(items);
        _currentPage = nextPage;
        _hasMore = items.length >= widget.pageSize;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
      Logger.error('Failed to load more data', e);
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (_error != null) {
      return widget.errorWidget ?? _buildDefaultErrorWidget();
    }
    
    if (_items.isEmpty && _isLoading) {
      return widget.loadingWidget ?? _buildDefaultLoadingWidget();
    }
    
    if (_items.isEmpty) {
      return widget.emptyWidget ?? _buildDefaultEmptyWidget();
    }
    
    return LazyLoadScrollView(
      scrollController: _scrollController,
      onEndOfPage: _loadMoreData,
      isLoading: _isLoading,
      child: ListView.separated(
        controller: _scrollController,
        shrinkWrap: widget.shrinkWrap,
        physics: widget.physics ?? const AlwaysScrollableScrollPhysics(),
        padding: widget.padding,
        itemCount: _items.length + (_hasMore ? 1 : 0),
        separatorBuilder: (context, index) => 
            widget.separatorBuilder ?? const SizedBox.shrink(),
        itemBuilder: (context, index) {
          if (index == _items.length) {
            return _buildLoadMoreIndicator();
          }
          
          return widget.itemBuilder(context, _items[index], index);
        },
      ),
    );
  }
  
  Widget _buildLoadMoreIndicator() {
    return Container(
      padding: const EdgeInsets.all(16),
      alignment: Alignment.center,
      child: const CircularProgressIndicator(),
    );
  }
  
  Widget _buildDefaultLoadingWidget() {
    return const Center(
      child: CircularProgressIndicator(),
    );
  }
  
  Widget _buildDefaultEmptyWidget() {
    return const Center(
      child: Text('No data available'),
    );
  }
  
  Widget _buildDefaultErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(
            Icons.error_outline,
            size: 48,
            color: Colors.red,
          ),
          const SizedBox(height: 16),
          Text(
            _error ?? 'An error occurred',
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _loadInitialData,
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }
}

/// Lazy loading widget that loads content when visible
class LazyLoadWidget extends StatefulWidget {
  final Widget Function() builder;
  final Widget? placeholder;
  final double visibilityThreshold;
  final Duration delay;
  
  const LazyLoadWidget({
    super.key,
    required this.builder,
    this.placeholder,
    this.visibilityThreshold = 0.1,
    this.delay = Duration.zero,
  });
  
  @override
  State<LazyLoadWidget> createState() => _LazyLoadWidgetState();
}

class _LazyLoadWidgetState extends State<LazyLoadWidget> {
  bool _isLoaded = false;
  Widget? _content;
  
  @override
  Widget build(BuildContext context) {
    // TODO: Use VisibilityDetector when package is added
    // For now, load immediately
    if (!_isLoaded) {
      _loadContent();
    }
    
    return _isLoaded
        ? _content!
        : widget.placeholder ?? _buildDefaultPlaceholder();
  }
  
  Future<void> _loadContent() async {
    if (widget.delay > Duration.zero) {
      await Future.delayed(widget.delay);
    }
    
    if (mounted) {
      setState(() {
        _content = widget.builder();
        _isLoaded = true;
      });
    }
  }
  
  Widget _buildDefaultPlaceholder() {
    return Container(
      height: 100,
      color: Colors.grey[200],
      child: const Center(
        child: CircularProgressIndicator(
          strokeWidth: 2,
        ),
      ),
    );
  }
}