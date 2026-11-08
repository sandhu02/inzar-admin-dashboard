# Phase 2 Report: Incidents List and Filtering

## 1. What Was Built
- **Backend & MSW Interception**:
  - `GET /admin/incidents`: Fully modeled in `src/lib/api/openapi-snapshot.json` and generated into `src/lib/api/schema.d.ts` with complete query parameters (`review_status`, `lifecycle_status`, `category_id`, `created_from`, `created_to`, `q`, `flagged`, `has_media`, `removed`, `near`, `bbox`, `sort`, `cursor`, `limit`).
  - MSW mock implementation (`src/mocks/handlers.ts`) backed by a seeded, deterministic dataset of 520 incidents (`src/mocks/incidents-data.ts`) spanning all categories, review statuses, lifecycle states, and Islamabad coordinates.
  - Privacy safeguards: `reporter_id` and raw exact coordinates are stripped from list items, returning only `place_label` and fuzzed approximate locations.
  - Spatial filtering: Computes Haversine great-circle distances for `near=lat,lng,radius_km` queries.
  - Offset cursor pagination with stable deterministic order.
- **Data Table & Ledger UI (`src/features/incidents/components/`)**:
  - `IncidentsLedger` (`incidents-ledger.tsx`): Coordinates filters, table, cards, URL synchronization, selection, and pagination.
  - `IncidentColumns` (`incident-columns.tsx`): TanStack Table column definitions for selection checkbox, category glyph, title + thumbnail fallback, review status badge, lifecycle status, flags count indicator, place label, reported time with UTC tooltip, relative age, and action menu.
  - `IncidentCardList` (`incident-card-list.tsx`): Responsive card layout optimized for tablet and mobile viewports (< 1024px).
  - `IncidentSearchBox`: Search input with 300ms debounce and `/` keyboard shortcut support.
  - `IncidentBulkActions` (`incident-bulk-actions.tsx`): Floating bottom bulk actions bar (`X SELECTED` with `Approve`, `Reject`, `Mark false`, `Remove`, and `Deselect`).
- **Advanced Filtering & Mini Map**:
  - `IncidentFilterPanel` (`incident-filter-panel.tsx`): Accessible dialog (`+ Add filter`) with category chips, review status, lifecycle status, date presets (Last 24h, 7d, 30d, 90d), flagged-only, and media-only switches.
  - `IncidentLocationFilter` (`incident-location-filter.tsx`): Interactive SVG radar mini-map centered on Islamabad (33.7294, 73.0551) with landmark pins (Margalla Hills, Blue Area, F-7 Markaz, Rawal Lake, Faizabad), coordinate inputs, and interactive radius slider (1–50 km).
  - `IncidentFilterChips` (`incident-filter-chips.tsx`): Removable filter chips with `Clear all` button matching Page 2 of `Inzar Admin Dashboard.pdf`.
- **URL Synchronization & Persistence**:
  - `useIncidentFilters` (`src/features/incidents/hooks/use-incident-filters.ts`): Deep URL synchronization via `nuqs` (query, status, category, date, flags, location, sorting, pagination, and view).
  - `useSavedViews` (`src/features/incidents/hooks/use-saved-views.ts`): Custom saved views lifecycle (Save current filters, Rename, Delete, Set default view) with `localStorage` persistence.
  - `useColumnVisibility` (`src/features/incidents/hooks/use-column-visibility.ts`): Toggle column visibility with `localStorage` persistence.

---

## 2. Verification Commands & Results
- `pnpm lint`: Passed with 0 errors (`eslint .`).
- `pnpm typecheck`: Passed with 0 errors (`tsc --noEmit`).
- `pnpm test`: 11 test files, 49 unit and integration tests passed (`vitest run`):
  - Saved views hook lifecycle (save, rename, delete, set default).
  - Filter chips rendering and removal callbacks.
  - Date formatting utilities (`formatReportedTime`, `formatAge`, `formatUtcTooltip`).
  - Incident API client parameter encoding and response transformation.
  - Incidents ledger integration with TanStack Query and mock router.
  - Status badge and category chip styling and role access permissions.
- `pnpm build`: Next.js production build succeeded with static pre-rendering and dynamic route compilation.
- `pnpm test:e2e`: 31/31 passed (1 skipped for viewport-specific column menu) across Desktop (1440px) and Tablet (768px):
  - Ledger renders seeded incidents and passes Axe accessibility scans with 0 violations.
  - Debounced text search filters rows and syncs with URL.
  - Filter dialog opens, applies category filter, and removes filter via chip.
  - Full URL state round-trip across page reload and back navigation.
  - Saved view creation and view switching.
  - Offset cursor pagination forwards and backwards.
  - Column visibility toggle menu hides columns.
  - Row selection and floating bulk actions bar.
  - Responsive tablet card list layout.
  - Responsive screenshots captured:
    - Desktop: `docs/screenshots/incidents-1440px.png`
    - Tablet: `docs/screenshots/incidents-768px.png`

---

## 3. Decisions & Adjustments
- Recorded in `docs/DECISIONS.md`:
  - Enforced strict privacy by omitting `reporter_id` and exact coordinates in the list endpoint.
  - Implemented lightweight, zero-dependency SVG mini-map with Islamabad landmarks for intuitive spatial radius filtering.
  - Used `outputFileTracingRoot` in `next.config.ts` to ensure clean build isolation and eliminate parent workspace trace warnings.
  - Configured explicit IPv4 (`127.0.0.1`) binding for Next.js and Playwright on Windows.
  - Added sr-only accessibility labels and matched accessible button names to satisfy WCAG 2.5.3 (Label in Name) and Axe table header rules.

---

## 4. Next Phase
- **Phase 3**: Incident Detail and Review Workspace:
  - Incident detail page (`/incidents/[id]`).
  - Media carousel with full-resolution preview and EXIF metadata view.
  - Audited reporter reveal modal (`POST /admin/incidents/{id}/reveal-reporter`).
  - Audited location reveal modal (`POST /admin/incidents/{id}/reveal-location`).
  - Review action buttons (Approve, Reject, Mark False, Remove, Change Category).
  - Activity audit log timeline and duplicate incident linking.
