# Phase 5 Report: Map View and Geographic Intelligence

## 1. What Was Built
- **Map View Architecture (`src/app/(dashboard)/map/page.tsx`, `src/features/map/`)**:
  - `MapView` (`src/features/map/components/map-view.tsx`): Main workspace coordinating client-side map canvas, shared filter bar, accessible alternative list, and slide-out preview panel with clean state transitions.
  - `DynamicIncidentMap` (`src/features/map/components/incident-map.tsx`): Next.js dynamic client component (SSR disabled) integrating MapLibre GL JS with hardware-accelerated WebGL clustering.
    - GeoJSON source with `cluster: true`, `clusterMaxZoom: 14`, and `clusterRadius: 50`.
    - Clustered circle layers stepped by count with Inzar brand palette (`#FF6B2C`, `#F97316`, `#EF4444`, `#DC2626`).
    - Individual markers styled with category colors and distinct category glyph icons (flame, alert-triangle, shield-alert, droplets, users, help-circle).
    - Selected marker glow ring (`#FF6B2C`, opacity `0.25`, stroke `2.5px`).
    - Hover popup cards displaying category, title, fuzzed coordinates, and time.
    - Custom floating zoom controls: Zoom In, Zoom Out, Re-center to Islamabad (`[73.0551, 33.7294]`), and Fit Visible Bounds.
    - Dynamic style switching matching theme changes (Inzar Dark Warm Graphite `#12110F` and Warm Bone Light `#F9F8F6`).
  - `MapFiltersBar` (`src/features/map/components/map-filters-bar.tsx`):
    - Search input with 300ms debouncing.
    - Multi-select category pills with category indicator dots.
    - Review status combobox and date preset combobox.
    - Filter toggles for Community Flagged, Media attached, and Removed incidents.
    - Viewport Sync toggle button and Accessible List toggle button.
    - Active filter counter and one-click reset button.
  - `MapAccessibleList` (`src/features/map/components/map-accessible-list.tsx`):
    - WCAG 2.1 AA compliant accessible alternative listbox for screen readers and keyboard navigation.
    - Full keyboard navigation: `ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`, `Space`, `Esc`.
    - W3C ARIA compliant: `<ul role="listbox">` with scrollable keyboard focus (`tabIndex={0}`) and direct interactive `<li role="option">` elements with roving focus.
  - `MapPreviewPanel` (`src/features/map/components/map-preview-panel.tsx`):
    - Slide-out incident detail panel displaying high-res thumbnail, title, description, time distance, and flags count.
    - Prominent reporter privacy notice: `FUZZED ~500M` badge and `Fuzzed ~250m for reporter privacy` mask notice.
    - Complete moderation actions toolbar (`Approve`, `Reject`, `Mark False`, `Mark Resolved`, `Re-run AI Review`, `Remove`, `Restore`).
    - Integrated `ActionDialog` requiring audit justification reasons for all moderation actions.
    - Escape key shortcut to close panel.
  - `MapLoadingSkeleton` (`src/features/map/components/map-loading-skeleton.tsx`):
    - Accessible loading placeholder with animated pulses matching map viewport and list dimensions.

- **Hooks and Utilities (`src/features/map/hooks/`, `src/features/map/lib/`)**:
  - `useMapFilters` (`src/features/map/hooks/use-map-filters.ts`): URL state synchronization via `nuqs` supporting deep linking for `q`, `category`, `review`, `lifecycle`, `date_preset`, `from`, `to`, `flagged`, `has_media`, `removed`, `selected`, `list_open`, and `viewport_sync`.
  - `useMapIncidents` (`src/features/map/hooks/use-map-incidents.ts`): TanStack Query hook managing debounced bounding box queries (`debounceMs: 300`) to avoid request storms during pan/zoom.
  - `geojson-utils.ts` (`src/features/map/lib/geojson-utils.ts`): Strictly enforces reporter privacy by converting incidents to GeoJSON FeatureCollections using only fuzzed coordinates (~250m jitter), never leaking exact GPS coordinates.
  - `map-constants.ts` & `map-styles.ts`: Islamabad geographic defaults, category color lookups, dark/light raster tile layer configurations, and SVG marker glyph generators.

- **BFF & Backend Mock Enhancements (`src/app/api/proxy/[...path]/route.ts`)**:
  - Enhanced `/admin/incidents` handling with degenerate bounding box validation (`minLon >= maxLon` or span `< 0.005` ignored to prevent headless canvas race conditions).
  - Fast-path mock dataset fallback when running in local/test environments (`session.accessToken.startsWith('mock_')`).
  - Added 2000ms timeout guard (`AbortSignal.timeout(2000)`) on backend proxy calls to prevent slow DevTunnel hangs.
  - Local HTTP session cookie support (`secure: false` for loopback `http://127.0.0.1:3000`).

---

## 2. Verification Commands & Results
- `pnpm lint`: Passed with 0 errors (`eslint .`):
  - Fixed React Compiler rule violations (`react-hooks/set-state-in-effect`, `react-hooks/refs`).
- `pnpm typecheck`: Passed with 0 errors (`tsc --noEmit`).
- `pnpm test`: 22 test files, 117 tests passed (`vitest run`):
  - `map-performance.test.ts`: Hardware-accelerated clustering benchmark verifying GeoJSON conversion and clustering for 5,000 mocked incidents under 15ms.
  - `geojson-utils.test.ts`: Hard privacy constraint verification ensuring exact coordinates are never exposed and fuzzed coordinates are properly structured.
  - `map-styles.test.ts`: Dark/light Carto raster tile style generator and custom tile URL support.
  - `map-accessible-list.test.tsx`: Visible incident rendering, keyboard navigation, selection, and empty state.
  - `map-preview-panel.test.tsx`: Preview render, fuzzed location badge, moderation action buttons, and reason dialog.
  - All existing suites for Phase 0–4 (Auth, Session, Permissions, Incident Ledger, Detail View, Queue, Flags).
- `pnpm build`: Next.js production build succeeded with static pre-rendering and dynamic route compilation.
- `pnpm exec playwright test e2e/map-view.spec.ts`: 12/12 tests passed across Desktop (1440px) and Tablet (768px):
  - Map view renders container and MapLibre GL canvas.
  - Automated Axe accessibility scan passed with 0 violations.
  - Clustering layers configured and zoom in/out / re-center to Islamabad controls verified.
  - Filter updates visible incidents and synchronizes with URL parameters (`?q=fire`, `?category=fire`).
  - Selecting an incident opens preview panel with prominent fuzzed coordinates badge (`FUZZED ~500M`, `Fuzzed ~250m for reporter privacy`).
  - Accessible listbox supports keyboard navigation with `ArrowDown` and selects via `Enter`.
  - Moderation action triggers `ActionDialog` reason modal and can be dismissed/cancelled.
  - Responsive screenshots captured:
    - Desktop (1440px): `docs/screenshots/map-1440px.png`
    - Tablet (768px): `docs/screenshots/map-768px.png`

---

## 3. Decisions & Adjustments
- Recorded in `docs/DECISIONS.md`:
  - **MapLibre GL JS with WebGL GeoJSON layers**: Open-source, zero vendor lock-in map engine supporting hardware-accelerated clustering up to 5,000+ points at 60fps with custom Inzar Warm Graphite dark (`#12110F`) and warm bone light (`#F9F8F6`) styles.
  - **Viewport-driven spatial queries with debounced bounding box (300ms)**: Synchronizes active map viewport bounding box (`minLng,minLat,maxLng,maxLat`) to API parameters with a 300ms debounce, preventing query flooding during pan and zoom interactions.
  - **Synchronized accessible listbox alternative for map incidents**: WCAG 2.1 AA compliance ensuring all spatial data is navigable via keyboard (Arrow keys, Enter, Space) and accessible to screen readers without relying solely on canvas graphics.
  - **Strict enforcement of fuzzed coordinates on map layers**: Inzar privacy mandate: map pins render only fuzzed coordinates (~250m jitter) and places, never exposing exact coordinates without audited reveal.
  - **Degenerate Bounding Box Guard**: Ignored zero-span or inverted bounding boxes in proxy and map callbacks to prevent unmeasured headless canvas dimensions from filtering out visible incidents.
  - **W3C ARIA Listbox Compliance**: Removed interactive `<button>` elements from inside `<li role="option">`, setting interactive handlers and roving focus on the `<li>` itself to eliminate Axe `no-focusable-content` violations.

---

## 4. Screenshot References
- Desktop Map View (1440px): `docs/screenshots/map-1440px.png`
- Tablet Map View (768px): `docs/screenshots/map-768px.png`
