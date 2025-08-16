import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';

class Comment {
  final String id;
  final String spotId;
  final String author;
  final String authorId;
  final String? authorAvatar;
  final String content;
  final DateTime createdAt;
  int likes;
  bool isLiked;

  Comment({
    required this.id,
    required this.spotId,
    required this.author,
    required this.authorId,
    this.authorAvatar,
    required this.content,
    required this.createdAt,
    required this.likes,
    required this.isLiked,
  });

  factory Comment.fromJson(Map<String, dynamic> json) {
    return Comment(
      id: json['id'],
      spotId: json['spotId'],
      author: json['author'],
      authorId: json['authorId'],
      authorAvatar: json['authorAvatar'],
      content: json['content'],
      createdAt: DateTime.parse(json['createdAt']),
      likes: json['likes'] ?? 0,
      isLiked: json['isLiked'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'spotId': spotId,
      'author': author,
      'authorId': authorId,
      'authorAvatar': authorAvatar,
      'content': content,
      'createdAt': createdAt.toIso8601String(),
      'likes': likes,
      'isLiked': isLiked,
    };
  }
}

class CommentService {
  final ApiClient _apiClient;

  CommentService(this._apiClient);

  // Get comments for a spot
  Future<List<Comment>> getComments(String spotId, {int limit = 50, int offset = 0}) async {
    try {
      final response = await _apiClient.get(
        '/signal-spots/$spotId/comments',
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );

      if (response.data['success'] == true && response.data['data'] != null) {
        final List<dynamic> commentsJson = response.data['data'];
        return commentsJson.map((json) => Comment.fromJson(json)).toList();
      }
      return [];
    } catch (e) {
      print('Error getting comments: $e');
      return [];
    }
  }

  // Add a comment to a spot
  Future<Comment?> addComment(String spotId, String content) async {
    try {
      final response = await _apiClient.post(
        '/signal-spots/$spotId/comments',
        data: {
          'content': content,
        },
      );

      if (response.data['success'] == true && response.data['data'] != null) {
        return Comment.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      print('Error adding comment: $e');
      return null;
    }
  }

  // Delete a comment
  Future<bool> deleteComment(String spotId, String commentId) async {
    try {
      final response = await _apiClient.delete(
        '/signal-spots/$spotId/comments/$commentId',
      );

      return response.data['success'] == true;
    } catch (e) {
      print('Error deleting comment: $e');
      return false;
    }
  }

  // Toggle like on a comment
  Future<Map<String, dynamic>?> toggleCommentLike(String spotId, String commentId) async {
    try {
      print('🔄 Toggling comment like - spotId: $spotId, commentId: $commentId');
      
      final response = await _apiClient.post(
        '/signal-spots/$spotId/comments/$commentId/like',
      );
      
      print('📡 Response status: ${response.statusCode}');
      print('📡 Response data: ${response.data}');

      if (response.data['success'] == true && response.data['data'] != null) {
        print('✅ Like toggled successfully');
        return response.data['data'];
      }
      
      print('⚠️ Response success is false or data is null');
      return null;
    } catch (e) {
      print('❌ Error toggling comment like: $e');
      if (e is DioException) {
        print('   Response: ${e.response?.data}');
        print('   Status code: ${e.response?.statusCode}');
      }
      return null;
    }
  }
}