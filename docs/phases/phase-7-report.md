# Phase 7 Report: Categories Taxonomy and Global Platform Settings

## 1. What Was Built

### Category Taxonomy Management (`src/app/(dashboard)/categories/page.tsx`, `src/features/categories/`)
- **Category Taxonomy View (`src/features/categories/components/categories-view.tsx`)**:
  - Header with title, descriptive subtitle, and "+ Add Category" button.
  - Metrics summary cards displaying Total Defined categories, Active Intake count, High Urgency categories, and Manual Review required count.
  - Loading skeleton state and error handling.
- **Categories List with Reordering (`src/features/categories/components/categories-list.tsx`)**:
  - Drag-and-drop reordering using native HTML5 drag-and-drop (`draggable`, `onDragStart`, `onDragOver`, `onDrop`) with visual ghosting and drop-target styling.
  - Keyboard-accessible Move Up and Move Down buttons for WCAG AA full keyboard compliance.
  - Displays sort order (`#1`, `#2`), live `CategoryChip`, unique mono slug, urgency tier badge (`routine` vs `high`), review routing badge (`Manual review` vs `Auto review`), retention timers (TTL and stale minutes), and active status badge.
  - Row actions: Edit button, Deactivate/Reactivate button, and disabled Delete button with explanatory tooltip ("Categories in use can only be deactivated, never deleted, to preserve historical incident integrity").
- **Live Marker & Chip Preview (`src/features/categories/components/category-marker-preview.tsx`)**:
  - Real-time interactive preview updating dynamically as form values change.
  - Renders MapLibre map marker pin representation with custom color, icon glyph, and pulsing emergency halo for high urgency.
  - Renders UI `CategoryChip` with custom colors and icon keys.
  - Summarizes retention timers (TTL and stale window) and manual review requirements.
- **Create & Edit Category Form Dialog (`src/features/categories/components/category-form-dialog.tsx`)**:
  - Modal form powered by `react-hook-form` and Zod validation schemas (`categorySchema` and `categoryUpdateSchema`).
  - Fields covering all specification tunables:
    - `slug`: Lowercase alphanumeric identifier, required, min 2 chars; strictly immutable and disabled in edit mode with `(Immutable)` label.
    - `name`: Human-readable display label.
    - `color_hex`: Hex color code input + clickable preset palette swatches (Signal Orange, Amber Warning, Mint Success, Coral Danger, Blue, Purple, Roadblock Bone, etc.).
    - `icon_key`: Dropdown selector populated from dynamic `CATEGORY_ICON_REGISTRY` (flame, alert-triangle, shield-alert, droplets, users, mountain, etc.).
    - `urgency`: Selector for `routine` vs `high` urgency tiers.
    - `default_ttl_minutes`: Positive integer for incident expiry window.
    - `stale_after_minutes`: Positive integer strictly less than `default_ttl_minutes`.
    - `resolve_flag_threshold`: Citizen resolved flags threshold to trigger auto-resolve review.
    - `notify_throttle_minutes`: Minimum interval between proximity alerts.
    - `notify_by_default`: Checkbox toggle for default push alert dispatch.
    - `require_manual_review`: Checkbox toggle to bypass auto-approval pipelines.
    - `is_active`: Checkbox toggle for public intake visibility.
    - `safety_note`: Optional guidance text for citizen reporters and moderators.
- **Category Deactivation Dialog (`src/features/categories/components/category-deactivate-dialog.tsx`)**:
  - Confirmation modal for deactivating or reactivating a category.
  - Warns that deactivating removes the category from mobile intake while existing historical reports remain intact.
- **Dynamic Category Filtering in Incidents (`src/features/incidents/components/incident-filter-panel.tsx`)**:
  - Connected `useCategories()` query hook to the incident filter panel, ensuring newly created categories appear dynamically in incident filters with fallback to default taxonomy.

---

### Global Platform Settings (`src/app/(dashboard)/settings/page.tsx`, `src/features/settings/`)
- **Global Settings View (`src/features/settings/components/settings-view.tsx`)**:
  - Header with title, subtitle, and top review mode status pill (`Manual Mode` / `Auto-Approve Mode`).
  - Governance & Audit metadata card showing "Last updated by: {actor}" and local timestamp with UTC ISO tooltip.
  - Full loading skeleton and error states.
- **Typed Global Settings Form (`src/features/settings/components/settings-form.tsx`)**:
  - Organized into 4 distinct operational sections:
    1. **Intake & Moderation Pipeline**:
       - `review_mode`: Interactive segmented control for `Manual Review` vs `Auto-Approve`, protected by a confirmation modal.
       - `abuse_flag_hide_threshold`: Number input for citizen spam auto-hide threshold.
       - `min_account_age_minutes_to_report`: Number input for account reporting quarantine window.
    2. **Geographic & Privacy Controls**:
       - `fuzz_distance_m`: Number input for public coordinate jitter distance.
       - `max_search_radius_km`: Number input for client search upper bound.
       - `allowed_radius_options_km`: Interactive chip tag editor with ability to add/remove preset radii in km.
    3. **Anti-Spam & Content Limits**:
       - `max_reports_per_user_per_hour`: Hourly reporting rate limit.
       - `max_description_length`: Upper character limit for incident narratives.
    4. **Emergency Alerts & Notifications**:
       - `alert_digest_threshold`: Incident count triggering alert digest bundling.
       - `alert_digest_window_minutes`: Rolling time window for localized digest aggregation.
  - Each setting card features:
    - Setting title and mono key name (e.g. `max_search_radius_km`)
    - Detailed explanatory description
    - Form input with proper accessibility labels
    - Canonical default value badge (e.g. `Default: 50`)
    - "Reset to default" button per setting
- **Review Mode Confirmation Modal (`src/features/settings/components/review-mode-dialog.tsx`)**:
  - Triggered when switching `review_mode` between `manual` and `auto_approve`.
  - Prominent operational safety notice explaining immediate public publishing vs queue review trade-offs.
- **Sticky Dirty-State Toolbar (`src/features/settings/components/settings-dirty-bar.tsx`)**:
  - Floating bottom bar appearing whenever form fields differ from server state.
  - Shows modified count, "Discard Changes" button, and "Save Settings" button with loading indicator.
- **Unsaved Changes Navigation Guard (`src/features/settings/components/settings-unsaved-guard.tsx`)**:
  - Listens to browser `beforeunload` events when form is dirty.
  - Intercepts internal link clicks in navigation, prompting with a modal to either stay or discard unsaved changes.

---

### Data Layer, BFF Proxy & Mock Handlers
- **Domain Schemas & Types (`src/features/categories/types.ts`, `src/features/categories/schemas.ts`, `src/features/settings/types.ts`, `src/features/settings/schemas.ts`)**:
  - Zod schemas enforcing strict validation rules (positive numbers, valid hex format, `stale_after_minutes < default_ttl_minutes`, slug formatting).
- **Mock Stores (`src/mocks/categories-data.ts`, `src/mocks/settings-data.ts`)**:
  - In-memory reactive state for 6 default categories + dynamic additions, updates, deactivations, and reordering.
  - In-memory state for global settings with actor tracking.
- **MSW Handlers & BFF Proxy Integration (`src/mocks/handlers.ts`, `src/app/api/proxy/[...path]/route.ts`)**:
  - `GET /admin/categories`: List categories sorted by `sort_order`.
  - `POST /admin/categories`: Create category (admin only, validates unique slug).
  - `PATCH /admin/categories/:id`: Update category / toggle status (admin only, immutable slug).
  - `PUT /admin/categories/reorder`: Reorder categories (admin only).
  - `GET /admin/settings`: Read global settings (admin only, 403 for moderators).
  - `PATCH /admin/settings`: Update settings (admin only, updates actor metadata).

---

## 2. Verification Commands & Results

1. `pnpm lint`: **PASSED** with 0 errors (`eslint .`):
   - 0 errors, 3 existing React Compiler memoization warnings on TanStack Table and React Hook Form `watch()`.
2. `pnpm typecheck`: **PASSED** with 0 errors (`tsc --noEmit`).
3. `pnpm test`: **PASSED** across all 31 test files and 195 unit and component tests (`vitest run`):
   - `src/features/categories/schemas.test.ts` (17 tests): Passing/failing cases for hex color regex, slug formatting, stale < TTL refinement rule, positive numbers, and update schema.
   - `src/features/settings/schemas.test.ts` (14 tests): Passing/failing cases for positive numbers, radius options array, review mode enum, and canonical defaults.
   - `src/features/categories/api/categories.test.ts` (6 tests): Fetch, create with custom TTL, duplicate slug rejection, update with immutable slug, deactivate/reactivate, reorder persistence.
   - `src/features/settings/api/settings.test.ts` (2 tests): Fetch current configuration, update settings with actor metadata.
   - `src/features/categories/components/categories-view.test.tsx` (4 tests): Header and metrics rendering, create dialog with live preview, edit dialog with immutable slug, deactivate dialog.
   - `src/features/settings/components/settings-view.test.tsx` (3 tests): Header and sections rendering, review mode confirmation modal, sticky dirty bar with discard/save.
   - All regression suites passing (Auth, Refresh, Permissions, Incidents, Queue, Flags, Map, Users).
4. `pnpm build`: **PASSED** (`next build --webpack`):
   - All 20 application routes compiled successfully, including `/categories` and `/settings`.
5. Playwright E2E (`e2e/categories-settings.spec.ts`): **14/14 PASSED** across Desktop (1440px) and Tablet (768px):
   - `categories taxonomy view renders, passes accessibility, and captures screenshots`: **PASSED** (0 axe violations).
   - `user journey: add new category with custom TTL and verify in incident filter panel`: **PASSED** (Landslide created with 300m TTL and appears in incident filter dialog).
   - `user journey: deactivate and reactivate category`: **PASSED** (status transitions to Deactivated and restores to Active).
   - `global settings view renders, passes accessibility, and captures screenshots`: **PASSED** (0 axe violations).
   - `user journey: change review_mode with confirmation modal and save settings`: **PASSED** (warning modal confirmed, dirty bar appears, saved, status pill updates to Auto-Approve, restored to Manual).
   - `user journey: modify numeric setting, verify dirty bar, reset to default, and discard`: **PASSED** (field modified, dirty bar appears, reset to 50, discarded).
   - `moderator access restriction: blocked from categories and settings pages`: **PASSED** (blocked with 403 Forbidden).

---

## 3. Decisions & Adjustments

- Recorded in `docs/DECISIONS.md`:
  - **Immutable Category Slugs with Deactivation-Only Lifecycle**: Preserved historical incident auditability by locking category slugs after creation and disallowing permanent deletion in favor of safe deactivation toggles.
  - **Native HTML5 Drag-and-Drop with Keyboard Reorder Controls**: Zero-dependency, accessible reordering supporting mouse dragging as well as keyboard-accessible Up/Down buttons for WCAG AA compliance.
  - **Dynamic Category Icon & Map Marker Preview**: Real-time preview combining MapLibre marker glyph pin representation and UI `CategoryChip` as operators tune category colors and icons.
  - **Operational Confirmation Guard on `review_mode` Switch**: Mandatory warning modal explaining the public safety impact when toggling between Manual review and Auto-Approve direct publishing.
  - **Sticky Dirty-State Bar & Unsaved Navigation Interceptor**: Prevents accidental configuration loss through a persistent bottom toolbar showing modified count, Discard/Save actions, and navigation link interception.

---

## 4. Screenshot References

- Desktop Categories Taxonomy (1440px): `docs/screenshots/categories-1440px.png`
- Tablet Categories Taxonomy (768px): `docs/screenshots/categories-768px.png`
- Desktop Global Settings (1440px): `docs/screenshots/settings-1440px.png`
- Tablet Global Settings (768px): `docs/screenshots/settings-768px.png`
