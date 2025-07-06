# Signal Spot API Documentation

## Overview

The Signal Spot API provides comprehensive endpoints for managing location-based Signal Spots with full CRUD operations, advanced querying, user interactions, and administrative functions.

## Authentication

All endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Additional authorization levels:
- **Verified User**: Email-verified and active users
- **Admin**: Verified users with admin privileges

## Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Spot Creation**: 5 requests per minute
- **Interactions**: 20 requests per minute

## Base URL

```
/api/signal-spots
```

## Endpoints

### Core CRUD Operations

#### `POST /`
**Create Signal Spot**
- Creates a new Signal Spot at specified location
- Rate Limited: 5 per minute
- Required: `message`, `latitude`, `longitude`
- Optional: `title`, `radiusInMeters`, `durationInHours`, `visibility`, `type`, `tags`, `metadata`

#### `GET /:id`
**Get Signal Spot by ID**
- Retrieves specific Signal Spot
- Records view count (if not creator)
- Respects visibility permissions

#### `PUT /:id`
**Update Signal Spot**
- Updates content and tags
- Creator-only access
- Updatable: `message`, `title`, `tags`

#### `DELETE /:id`
**Remove Signal Spot**
- Permanently removes Signal Spot
- Creator or admin access required

### Discovery & Search

#### `GET /nearby`
**Get Nearby Signal Spots**
- Location-based discovery
- Required: `latitude`, `longitude`
- Optional: `radiusKm`, `limit`, `offset`, `types`, `tags`, `search`, `visibility`

#### `GET /trending`
**Get Trending Signal Spots**
- Recent high-engagement spots
- Optional location filtering
- Algorithm-based trending calculation

#### `GET /popular`
**Get Popular Signal Spots**
- High-engagement spots by timeframe
- Timeframes: `hour`, `day`, `week`, `month`
- Optional location filtering

#### `GET /search`
**Search Signal Spots**
- Full-text search in content
- Required: `q` (search query)
- Optional location filtering

#### `GET /tags/:tags`
**Get Signal Spots by Tags**
- Tag-based filtering
- Comma-separated tags in path
- Supports AND/OR matching (`matchAll` parameter)

### User Management

#### `GET /my-spots`
**Get Current User's Signal Spots**
- User's created spots
- Optional: `includeExpired`, pagination

#### `GET /statistics`
**Get User Statistics**
- Personal engagement metrics
- Spot counts, views, likes, etc.

#### `GET /:id/similar`
**Get Similar Signal Spots**
- AI-based similarity matching
- Based on location, type, tags, content

### Interactions

#### `POST /:id/interact`
**Interact with Signal Spot**
- Rate Limited: 20 per minute
- Types: `like`, `dislike`, `reply`, `share`, `report`
- Additional fields for reports/replies

### Spot Management

#### `POST /:id/extend`
**Extend Spot Duration**
- Creator-only access
- Max 48 additional hours

#### `POST /:id/pause`
**Pause Signal Spot**
- Temporarily deactivate
- Creator-only access

#### `POST /:id/resume`
**Resume Signal Spot**
- Reactivate paused spot
- Creator-only access

#### `POST /:id/pin`
**Pin Signal Spot**
- Prominently display spot
- Creator or admin access

#### `POST /:id/unpin`
**Unpin Signal Spot**
- Remove prominent display
- Creator or admin access

### Analytics

#### `GET /location-stats`
**Get Location Statistics**
- Area-based metrics
- Required: `latitude`, `longitude`
- Optional: `radiusKm`

### Admin Endpoints

#### `GET /admin/reported`
**Get Reported Signal Spots**
- Admin-only access
- Moderation queue
- Optional filtering by report count/reason

#### `GET /admin/expiring`
**Get Expiring Signal Spots**
- Admin-only access
- Spots needing attention
- Configurable time threshold

#### `GET /admin/statistics`
**Get System Statistics**
- Admin-only access
- System-wide metrics
- Popular types, tags, trends

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0",
    "requestId": "abc123xyz"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... },
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/signal-spots/123"
  }
}
```

## Data Models

### Signal Spot Response
```json
{
  "id": "uuid",
  "creatorId": "uuid",
  "message": "string",
  "title": "string?",
  "location": {
    "latitude": "number",
    "longitude": "number", 
    "radius": "number"
  },
  "status": "active|expired|paused|removed",
  "visibility": "public|friends|private",
  "type": "announcement|question|meetup|alert|social|business",
  "tags": ["string"],
  "engagement": {
    "viewCount": "number",
    "likeCount": "number",
    "dislikeCount": "number",
    "replyCount": "number",
    "shareCount": "number",
    "engagementScore": "number",
    "popularityScore": "number"
  },
  "timing": {
    "createdAt": "datetime",
    "expiresAt": "datetime",
    "remainingTime": "string",
    "isExpired": "boolean"
  },
  "isPinned": "boolean"
}
```

## Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `DUPLICATE_RESOURCE`: Resource already exists
- `INVALID_REFERENCE`: Referenced resource not found
- `MISSING_REQUIRED_FIELD`: Required field is missing
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INSUFFICIENT_PERMISSIONS`: Access denied
- `RESOURCE_NOT_FOUND`: Resource not found
- `INTERNAL_SERVER_ERROR`: Server error

## Security Features

- JWT-based authentication
- Role-based authorization (User, Admin)
- Rate limiting per endpoint
- Input validation and sanitization
- SQL injection protection
- XSS protection
- Request/response logging
- Error tracking and monitoring

## Performance Features

- Database indexing on location and timestamps
- Efficient geographic queries
- Pagination support
- Response caching headers
- Compressed responses
- Query optimization

## Best Practices

1. **Pagination**: Use `limit` and `offset` for large datasets
2. **Location Queries**: Provide reasonable radius limits
3. **Error Handling**: Check `success` field in responses
4. **Rate Limiting**: Implement exponential backoff for 429 errors
5. **Caching**: Cache location-based queries when possible
6. **Validation**: Validate coordinates and required fields client-side
7. **Security**: Store JWT tokens securely, implement logout
8. **Performance**: Debounce search queries, limit concurrent requests