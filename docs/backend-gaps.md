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

## 2. User Moderation and Governance Extensions

### `GET /admin/users`
- **Method**: GET
- **Description**: Returns paginated list of user accounts with search, role, status, verification, and date range filters.
- **Query Parameters**:
  - `q`: string (search in `display_name` and `email`)
  - `role`: string (`admin`, `moderator`, `user`)
  - `status`: string (`active`, `suspended`)
  - `verified`: string (`verified`, `unverified`)
  - `date_preset`: string (`today`, `24h`, `7d`, `30d`, `custom`)
  - `created_from`: ISO 8601 timestamp
  - `created_to`: ISO 8601 timestamp
  - `sort`: string (`created_at:desc`, `created_at:asc`, `display_name:asc`, `display_name:desc`, `reports_count:desc`, `reports_count:asc`)
  - `cursor`: string / offset
  - `limit`: integer (default 25)
- **Response Shape**:
  ```json
  {
    "items": [
      {
        "id": "usr_...",
        "display_name": "Hamza Malik",
        "email": "hamza.malik@example.com",
        "role": "user",
        "is_suspended": false,
        "is_verified": true,
        "reports_count": 16,
        "flags_count": 3,
        "created_at": "2026-02-14T10:00:00Z",
        "last_active_at": "2026-11-15T08:30:00Z",
        "suspension_reason": null,
        "suspended_at": null,
        "suspended_by": null
      }
    ],
    "total_count": 20,
    "next_cursor": "25"
  }
  ```
- **Privacy Rule**: Email addresses are strictly redacted (`email = null`) when requested by non-administrator roles (`moderator`).

### `GET /admin/users/{id}`
- **Method**: GET
- **Description**: Returns full user profile, numerical metrics, session list, and moderation audit history.
- **Response Shape**:
  ```json
  {
    "id": "usr_...",
    "display_name": "Hamza Malik",
    "email": "hamza.malik@example.com",
    "role": "user",
    "is_suspended": false,
    "is_verified": true,
    "reports_count": 16,
    "flags_count": 3,
    "created_at": "2026-02-14T10:00:00Z",
    "last_active_at": "2026-11-15T08:30:00Z",
    "stats": {
      "total_reports": 16,
      "published_reports": 11,
      "under_review_reports": 2,
      "rejected_reports": 2,
      "false_reports": 1,
      "removed_reports": 0,
      "flags_received": 3
    },
    "sessions": [
      {
        "id": "sess_1",
        "device": "Inzar Mobile App (Android 14)",
        "ip_address": "182.185.120.12",
        "created_at": "2026-11-10T14:22:00Z",
        "last_seen_at": "2026-11-15T08:30:00Z",
        "is_current": false
      }
    ],
    "moderation_history": [
      {
        "id": "mod_1",
        "action": "false_report_penalty",
        "reason": "Submitted staged photo as emergency fire incident",
        "actor": "Sana Rehman (Admin)",
        "created_at": "2026-10-04T11:15:00Z"
      }
    ]
  }
  ```
- **Privacy Rule**: `email` is redacted (`null`) for moderator viewers.

### `GET /admin/users/{id}/incidents`
- **Method**: GET
- **Description**: Returns paginated list of incidents submitted by the specified user.
- **Privacy Rule**: Accessing reported incidents respects fuzzed location and masked reporter identity rules.

### `PATCH /admin/users/{id}`
- **Method**: PATCH
- **Description**: Modifies user suspension status or alters staff access role.
- **Body**:
  ```json
  {
    "is_suspended": true,
    "reason": "Repeated submission of spam and fake incident reports",
    "notes": "Internal audit ticket #9421",
    "role": "moderator"
  }
  ```
- **Business & Security Rules**:
  1. **Reason Required**: When suspending an account (`is_suspended: true`), `reason` is strictly mandatory.
  2. **Self-Protection Guard**: A staff member cannot suspend their own account or modify/demote their own role (`CANNOT_MODIFY_SELF`).
  3. **Last-Admin Guard**: If the target user is an administrator and only one administrator exists in the system, demotion to non-admin is rejected (`LAST_ADMIN_GUARD` / HTTP 409).
  4. **Admin-Only Role Modification**: Only users with the `admin` role may alter roles. Requests by `moderator` return HTTP 403 `FORBIDDEN`.

### `POST /admin/users/{id}/revoke-sessions`
- **Method**: POST
- **Description**: Immediately revokes all active refresh tokens and sessions for the specified user, forcing re-authentication.
- **Body**: `{ "reason": "Administrative security revocation" }`
- **Audit**: Writes audit log entry.

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

---

## 5. Moderation Queue and Community Flags

### `GET /admin/moderation/queue`
- **Method**: GET
- **Description**: Returns all incident reports awaiting review (`review_status` is `needs_review` or `under_review`), sorted by oldest first, with calculated queue metadata.
- **Query Parameters**:
  - `category_id`: string (optional category filter)
  - `limit`: integer (default 50)
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
        "thumbnail_url": "https://res.cloudinary.com/...",
        "media_urls": ["https://res.cloudinary.com/..."],
        "verification_label": "ai_reviewed",
        "flags": [
          {
            "id": "flag_1",
            "type": "incorrect",
            "reason": "Duplicate report",
            "created_at": "2026-11-08T09:30:00Z",
            "status": "pending"
          }
        ]
      }
    ],
    "queue_size": 14,
    "oldest_item_age_minutes": 38,
    "oldest_reported_at": "2026-11-08T13:52:00Z"
  }
  ```

### `POST /admin/moderation/{id}/approve`
- **Method**: POST
- **Description**: Approves an incident from the moderation queue and transitions `review_status` to `published`.
- **Body**: `{ "notes": "string (optional)" }`
- **Audit**: Writes audit log entry for staff approval decision.

### `POST /admin/moderation/{id}/reject`
- **Method**: POST
- **Description**: Rejects an incident with a required justification reason, transitioning `review_status` to `not_approved`.
- **Body**: `{ "reason": "string (required)", "notes": "string (optional)" }`
- **Audit**: Writes audit log entry for staff rejection decision.

### `GET /admin/flags`
- **Method**: GET
- **Description**: Returns community-reported flags grouped by incident report, including distinct flagger counts and flag details.
- **Query Parameters**:
  - `type`: string (`all`, `incorrect`, `abuse`, `resolved`)
  - `status`: string (`all`, `pending`, `reviewed`, `dismissed`)
  - `category_id`: string (optional category filter)
  - `q`: string (search in incident title or description)
  - `limit`: integer (default 50)
- **Response Shape**:
  ```json
  {
    "items": [
      {
        "incident_id": "inc_001",
        "incident_title": "Brush fire near Trail 4",
        "incident_description": "Brush fire on the slope above Trail 4...",
        "incident_thumbnail_url": "https://images.unsplash.com/...",
        "category": { "id": "cat_3", "slug": "fire", "name": "Fire", "color_hex": "#EF4444", "icon_key": "flame" },
        "review_status": "under_review",
        "lifecycle_status": "active",
        "place_label": "F-7 · Margalla Rd",
        "reported_at": "2026-11-08T14:28:00Z",
        "flags_count": 2,
        "distinct_flaggers_count": 2,
        "flags": [
          {
            "id": "flag_inc_001_1",
            "incident_id": "inc_001",
            "type": "resolved",
            "reason": "Fire services have put out the flames.",
            "created_at": "2026-11-08T14:38:00Z",
            "flagger_count": 1,
            "status": "pending"
          }
        ]
      }
    ],
    "total_count": 6,
    "awaiting_count": 9,
    "distinct_incidents_count": 6
  }
  ```

### `PATCH /admin/flags/{id}`
- **Method**: PATCH
- **Description**: Updates the review state of a community flag (e.g. dismissing or resolving).
- **Body**: `{ "status": "pending" | "reviewed" | "dismissed", "notes": "string (optional)" }`
- **Audit**: Writes audit log entry.

---

## 6. Category Taxonomy and Platform Settings Extensions

### `POST /admin/categories`
- **Method**: POST
- **Description**: Creates a new incident classification category with retention timers, urgency, and moderation rules.
- **Permission**: `admin` only (moderator returns HTTP 403 `FORBIDDEN`).
- **Body**:
  ```json
  {
    "slug": "landslide",
    "name": "Landslide",
    "icon_key": "mountain",
    "color_hex": "#FF6B2C",
    "is_active": true,
    "sort_order": 7,
    "urgency": "high",
    "default_ttl_minutes": 300,
    "stale_after_minutes": 100,
    "resolve_flag_threshold": 3,
    "notify_throttle_minutes": 15,
    "notify_by_default": true,
    "require_manual_review": false,
    "safety_note": "Watch for falling rocks and road instability."
  }
  ```
- **Validation**:
  1. `slug` must be unique across all categories (`SLUG_CONFLICT` / HTTP 409).
  2. `stale_after_minutes` must be strictly less than `default_ttl_minutes`.
  3. `color_hex` must match valid `#RGB` or `#RRGGBB` format.
  4. Numeric values must be positive integers.

### `PATCH /admin/categories/{id}`
- **Method**: PATCH
- **Description**: Modifies category properties or toggles active status. Slug is immutable and cannot be altered after creation.
- **Permission**: `admin` only.
- **Deactivation Rule**: Categories in use cannot be permanently deleted to preserve historic incident audit integrity; deactivating sets `is_active: false`.

### `PUT /admin/categories/reorder`
- **Method**: PUT
- **Description**: Updates the display order sequence of categories.
- **Permission**: `admin` only.
- **Body**:
  ```json
  {
    "items": [
      { "id": "cat_fire", "sort_order": 1 },
      { "id": "cat_accident", "sort_order": 2 }
    ]
  }
  ```

### `GET /admin/settings`
- **Method**: GET
- **Description**: Fetches global platform runtime settings including intake review mode, spatial boundaries, and rate limits.
- **Permission**: `admin` only.
- **Response Shape**:
  ```json
  {
    "max_search_radius_km": 50,
    "allowed_radius_options_km": [1, 5, 10, 25, 50],
    "fuzz_distance_m": 250,
    "max_reports_per_user_per_hour": 5,
    "max_description_length": 500,
    "review_mode": "manual",
    "abuse_flag_hide_threshold": 5,
    "alert_digest_threshold": 3,
    "alert_digest_window_minutes": 30,
    "min_account_age_minutes_to_report": 15,
    "updated_at": "2026-11-15T10:00:00Z",
    "updated_by": "Sana Rehman (Admin)"
  }
  ```

### `PATCH /admin/settings`
- **Method**: PATCH
- **Description**: Updates global platform configuration settings.
- **Permission**: `admin` only.
- **Audit**: Writes audit log entry recording actor and modified settings before/after values.


