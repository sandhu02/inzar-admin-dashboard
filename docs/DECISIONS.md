# Architecture and Implementation Decisions

Record of engineering decisions made during development.

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-08 | Use `src/` directory structure | Aligns with Section 5 architecture specification and separates app code from repo configs. |
| 2026-11-08 | BFF session with `jose` AES-256-GCM encryption | Protects backend tokens from client-side script access (XSS mitigation) while enabling single-flight token rotation. |
| 2026-11-08 | MSW v2 for mock interception | Enables full fidelity offline development and Playwright E2E testing mirroring backend contract gaps. |
| 2026-11-08 | Tailwind CSS v4 with custom theme tokens via CSS variables | Provides zero-runtime design tokens matching the Inzar warm graphite aesthetic. |
| 2026-11-08 | URL-driven filter state via `nuqs` | Deep linkability and back/forward browser history support for all table filter parameters. |
| 2026-11-08 | SVG mini-map for location radius filter | Zero-dependency, lightweight, interactive spatial filtering centered on Islamabad coordinates. |
| 2026-11-08 | Stripping coordinates and reporter ID in list endpoint | Strict privacy enforcement: list views only show place labels and fuzzed pins, requiring explicit audit reveal for full PII. |
| 2026-11-08 | LocalStorage fallback for saved views and column visibility | Provides persistent custom views across browser refreshes ahead of `/admin/me/preferences` backend implementation. |
| 2026-11-11 | Keyboard-first Moderation Queue with strict input isolation | Allows operators to process backlogged incidents at speed (A/R/F/J/K/?) without mouse interaction, while preventing unintended hotkeys during text input. |
| 2026-11-11 | 5-second undo strictly for incident approvals | Approvals are non-destructive and optimistically advance with a 5s countdown undo window. Destructive actions (`reject`, `mark_false`) require justification reasons and explicit confirmation. |
| 2026-11-11 | Incident-level Community Flags grouping with `nuqs` URL state | Aggregates disparate community reports per incident with distinct flagger counts and deep-linkable status/type filters (`/flags?status=pending`). |
| 2026-11-13 | MapLibre GL JS with WebGL GeoJSON layers for 5,000 incident clustering | Open-source, zero vendor lock-in map engine supporting hardware-accelerated clustering up to 5,000+ points at 60fps with custom Inzar Warm Graphite dark (#12110F) and warm bone light (#F9F8F6) styles. |
| 2026-11-13 | Viewport-driven spatial queries with debounced bounding box (300ms) | Synchronizes active map viewport bounding box (minLng,minLat,maxLng,maxLat) to API parameters with a 300ms debounce, preventing query flooding during pan and zoom interactions. |
| 2026-11-13 | Synchronized accessible listbox alternative for map incidents | WCAG 2.1 AA compliance ensuring all spatial data is navigable via keyboard (Arrow keys, Enter, Space) and accessible to screen readers without relying solely on canvas graphics. |
| 2026-11-13 | Strict enforcement of fuzzed coordinates on map layers | Inzar privacy mandate: map pins render only fuzzed coordinates (~250m jitter) and places, never exposing exact coordinates without audited reveal. |
| 2026-11-15 | Hierarchical defense-in-depth for Last-Admin and Self-Protection guards | Prevents accidental system lockout by guaranteeing at least one active administrator remains (`LAST_ADMIN_GUARD`), and disallows operators from modifying their own role or self-suspending (`CANNOT_MODIFY_SELF`). |
| 2026-11-15 | Role-based PII redaction for citizen email addresses | Restricts email addresses to administrators at the BFF proxy/MSW layer (`email = null` for non-admin viewers), displaying masked indicators (`••••••••`) to operational moderators. |
| 2026-11-15 | Unified URL state synchronization for user governance with `nuqs` | Syncs filters, search (`q`), role, status, verification, date presets, sorting, and pagination with URL parameters for deep linking and back-button navigation. |
| 2026-11-19 | Immutable Category Slugs with Deactivation-Only Lifecycle | Preserves historic incident auditability by locking category slugs after creation and disallowing permanent deletion in favor of safe deactivation toggles. |
| 2026-11-19 | Native HTML5 Drag-and-Drop with Keyboard Reorder Controls | Zero-dependency, accessible reordering supporting mouse dragging as well as keyboard-accessible Up/Down buttons for WCAG AA compliance. |
| 2026-11-19 | Dynamic Category Icon & Map Marker Preview | Real-time preview combining MapLibre marker glyph pin representation and UI `CategoryChip` as operators tune category colors and icons. |
| 2026-11-19 | Operational Confirmation Guard on `review_mode` Switch | Mandatory warning modal explaining the public safety impact when toggling between Manual review and Auto-Approve direct publishing. |
| 2026-11-19 | Sticky Dirty-State Bar & Unsaved Navigation Interceptor | Prevents accidental configuration loss through a persistent bottom toolbar showing modified count, Discard/Save actions, and navigation link interception. |
