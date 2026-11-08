# Backend Contract Gaps and Proposed Endpoints

This document tracks endpoints and capabilities required by the Inzar Admin Dashboard that are missing or require extension in the FastAPI backend (`/api/v1`).

Until backend updates are published, these contracts are implemented via MSW handlers (`src/mocks/handlers.ts`) enabled when `NEXT_PUBLIC_USE_MOCKS=true`.

---

## 1. Incidents Management

### `GET /admin/incidents`
- **Method**: GET
- **Description**: List all incidents across all review and lifecycle states with advanced filtering and pagination.
- **Query Parameters**:
  - `review_status`: string (`ai_reviewed`, `needs_review`, `published`, `not_approved`, `removed`, `false_report`)
  - `lifecycle_status`: string (`active`, `resolved`, `expired`, `hidden`)
  - `category_id`: string (repeatable)
  - `created_from`: ISO 8601 timestamp
  - `created_to`: ISO 8601 timestamp
  - `q`: string (full-text search in title and description)
  - `flagged`: boolean
  - `reporter_id`: string
  - `has_media`: boolean
  - `removed`: boolean (include soft-deleted items)
  - `near`: string (`lat,lng,radius_km`)
  - `bbox`: string (`min_lon,min_lat,max_lon,max_lat`)
  - `sort`: string (`reported_at:desc`, `reported_at:asc`, `flag_count:desc`, `status:asc`)
  - `cursor`: string
  - `limit`: integer (default 25, max 100)
- **Response Shape**:
  ```json
  {
    "items": [
      {
        "id": "inc_...",
        "title": "string",
        "description": "string",
        "category": { "id": "cat_...", "slug": "fire", "name": "Fire", "color_hex": "#FF6B2C", "icon_key": "flame" },
        "review_status": "under_review",
        "lifecycle_status": "active",
        "flags_count": 2,
        "place_label": "F-7 · Margalla Rd",
        "fuzzed_location": { "lat": 33.7294, "lng": 73.0551 },
        "reported_at": "2026-11-08T09:23:00Z",
        "has_media": true,
        "thumbnail_url": "https://res.cloudinary.com/..."
      }
    ],
    "next_cursor": "string | null",
    "total_count": 2481
  }
  ```
- **Privacy Rule**: Reporter identity (`reporter_id`, user details) and exact location (`exact_location`) must be omitted from list items.

### `POST /admin/incidents/{id}/reveal-reporter`
- **Method**: POST
- **Body**: `{ "reason": "string" }`
- **Response**: `{ "reporter": { "id": "usr_...", "display_name": "string", "email": "string", "trust_score": 85 } }`
- **Audit**: Writes audit log entry with actor, incident ID, and reveal reason.

### `POST /admin/incidents/{id}/reveal-location`
- **Method**: POST
- **Body**: `{ "reason": "string" }`
- **Response**: `{ "exact_location": { "lat": 33.729381, "lng": 73.055122 } }`
- **Audit**: Writes audit log entry.

### `POST /admin/incidents/{id}/mark-false`
- **Method**: POST
- **Body**: `{ "reason": "string" }`
- **Audit**: Recorded against incident and reporter's moderation record.

### `POST /admin/incidents/{id}/remove` & `POST /admin/incidents/{id}/restore`
- **Method**: POST
- **Body**: `{ "reason": "string" }`
- **Behavior**: Soft removal; restores within retention window.

### `POST /admin/incidents/bulk`
- **Method**: POST
- **Body**: `{ "ids": ["string"], "action": "approve | reject | mark_false | remove", "reason": "string" }`
- **Response**:
  ```json
  {
    "succeeded": ["inc_1", "inc_2"],
    "failed": [
      { "id": "inc_3", "error": { "code": "STATE_CONFLICT", "message": "Already resolved" } }
    ]
  }
  ```

---

## 2. User Moderation Extensions

### `GET /admin/users/{id}`
- **Detail response**: includes incident counts by status, flags received, session list, moderation penalties.

### `POST /admin/users/{id}/revoke-sessions`
- **Method**: POST
- **Body**: `{}`
- **Behavior**: Revokes all active refresh tokens for the specified user.

---

## 3. Overview Statistics

### `GET /admin/stats/overview`
- **Query**: `period=24h | 7d | 30d`
- **Response**:
  ```json
  {
    "queue_size": 14,
    "oldest_queue_item_age_minutes": 38,
    "new_incidents_count": 212,
    "flags_awaiting_action": 9,
    "flags_distinct_incidents": 6,
    "job_failures_count": 3,
    "job_backlog_count": 27,
    "active_users_count": 1284,
    "alerts_sent_count": 3906,
    "incidents_over_time": [
      { "label": "Mon", "count": 24 },
      { "label": "Tue", "count": 31 }
    ],
    "by_category": [
      { "category_slug": "accident", "name": "Accident", "count": 71 },
      { "category_slug": "road_block", "name": "Road Block", "count": 46 }
    ],
    "by_review_outcome": {
      "published": 164,
      "under_review": 14,
      "not_approved": 29,
      "false_report": 5
    }
  }
  ```

---

## 4. Admin User Preferences & Saved Views

### `GET /admin/me/preferences`
- **Method**: GET
- **Description**: Returns per-staff preferences including saved views and column visibility settings. Currently persisted client-side in `localStorage` (`inzar_incident_saved_views`, `inzar_incident_column_visibility`).
- **Response Shape**:
  ```json
  {
    "saved_views": [
      {
        "id": "view_123",
        "name": "Margalla High Risk",
        "filters": {
          "category": "fire,landslide",
          "near_lat": 33.7294,
          "near_lng": 73.0551,
          "radius_km": 15
        },
        "is_default": true,
        "created_at": "2026-11-08T12:00:00Z"
      }
    ],
    "column_visibility": {
      "flags_count": true,
      "place_label": true,
      "age": true
    }
  }
  ```

### `PUT /admin/me/preferences`
- **Method**: PUT
- **Description**: Updates admin user preferences and saved filter presets.
- **Body**: Same shape as preferences response.
