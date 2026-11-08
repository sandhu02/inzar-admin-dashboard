# Inzar Admin Dashboard: Claude Code Prompt

Give everything below the line to Claude Code in an empty repo (or paste it into a `CLAUDE.md` plus a first message). Phases are numbered so you can send them one at a time.

---

## 1. Role and operating rules

You are a senior frontend engineer building the **admin dashboard for Inzar**, a crowdsourced, real-time local incident reporting app (mobile app in Flutter, FastAPI backend with Neon Postgres/PostGIS). The dashboard is used by **admins and moderators** to review, moderate and manage everything the mobile app produces. Build a complete, working, production-quality web app with Next.js, not a prototype with placeholder screens.

Working rules:

1. Work **phase by phase** in the order in section 9. Do not start a phase until the previous one is finished and verified.
2. **Verify everything yourself.** At the end of each phase run, in order: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, then the Playwright tests for that phase. Start the dev server and check the screens in a real browser (Playwright screenshots at 1440 px and 768 px widths; review them and fix visual problems). Fix every failure before moving on. Never skip or weaken a test to make a phase pass.
3. At the end of each phase write `docs/phases/phase-N-report.md` (what was built, commands run, results, known gaps, decisions) and make one git commit named `phase N: <title>`.
4. First create a root `CLAUDE.md` containing the conventions in this prompt (stack, folder rules, commands, hard constraints) so they persist across sessions. Keep it under 150 lines.
5. Do not ask questions unless truly blocked. Make the most reasonable choice and record it in `docs/DECISIONS.md` with a one-line reason.
6. Do not invent features outside this document. Small supporting pieces needed to make a described feature work are fine.
7. Check current official documentation (Next.js App Router, shadcn/ui, TanStack Query/Table, MapLibre GL, openapi-typescript) before relying on memory for APIs that change between versions.

## 2. Product context

Inzar lets people capture an incident with the in-app camera, pick a category, add a description and location, and submit it. A server-side review pipeline (AI review is currently a stub; a moderator queue exists) ends each report in **published**, **needs review** or **rejected**. Published incidents appear on a live map for nearby users, and nearby users get alerts.

This dashboard is the control room for that system. It is **not** a public site and not a social product: no likes, comments, followers or public profiles anywhere.

Principles that shape every screen:

- **Trust and honesty:** never describe an incident as confirmed unless the data says so. Show verification labels exactly as the backend sends them (`ai_reviewed`, `community_corroborated`, none). Do not invent scores or confidence percentages.
- **Privacy by default:** reporter identity and exact incident coordinates are hidden by default. Revealing either is an explicit, audited action (section 7, reveal endpoints). The reveal state must not persist across page loads.
- **Safe destructive actions:** reject, mark false, remove, suspend and role changes always require a reason and a confirmation. Remove is a soft removal that can be restored.
- **Speed for moderators:** the queue must be operable almost entirely by keyboard, with large readable photos and one-click decisions.
- **Auditability:** every write the dashboard performs is audit-logged by the backend; the dashboard must surface those logs.

## 3. Technology stack (fixed)

| Concern | Choice |
| --- | --- |
| Framework | Next.js (latest stable), App Router, React Server Components where useful |
| Language | TypeScript, `strict` plus `noUncheckedIndexedAccess` |
| Package manager | pnpm |
| Styling | Tailwind CSS with design tokens as CSS variables |
| Components | shadcn/ui (Radix primitives), lucide-react icons |
| Server state | TanStack Query v5 |
| Tables | TanStack Table v8 with server-side pagination, sorting, filtering |
| Forms and validation | React Hook Form with Zod |
| API client | Generated from the backend OpenAPI spec with `openapi-typescript` and `openapi-fetch` |
| URL state | `nuqs` (all filters, sort, page and selected tab live in the URL) |
| Maps | MapLibre GL JS (clustered GeoJSON source) |
| Charts | Recharts |
| Theming | `next-themes`, dark-first with a light theme |
| Dates | `date-fns` (all times stored UTC, shown in the admin's local zone with a UTC tooltip) |
| Tests | Vitest and Testing Library (units and components), MSW (API mocks), Playwright (end-to-end), `@axe-core/playwright` (accessibility) |
| Quality | ESLint, Prettier, `husky` plus `lint-staged`, `commitlint` optional |
| Deployment | Vercel by default; also provide a production Dockerfile so it can run on Render (a Node web service) |

## 4. Visual identity (matches the Inzar mobile app)

The dashboard must look like the same product as the mobile app, not a generic admin template.

- **Dark-first** warm graphite palette: background `#12110F`, surface `#1C1A17`, elevated surface `#26231F`, borders `#35312B`, primary text bone `#F2EDE4`, secondary text `#A8A094`. Accent **signal orange** `#FF6B2C` used sparingly (primary highlights, active nav marker, key calls to action, fire category). Status colors: info `#7CC4FF`, warning `#FFC14D`, success `#6FD8A0`, danger `#FF7B6E`. Provide a considered light theme with equivalent contrast.
- **Typography:** Schibsted Grotesk for UI text, JetBrains Mono for IDs, timestamps, distances and status labels (the mobile app uses the same pairing). Load with `next/font`.
- **Components:** primary action buttons are filled bone with dark text; orange is reserved for the single most important action on a screen. Moderate radius (10 to 14 px), thin 1 px borders instead of heavy shadows, no gradients or glassmorphism.
- **Status badges** always combine an icon and text, never color alone (same set as the app: AI reviewed, Under review, Published, Not approved, plus Removed and False report).
- **Category markers** use the category's own color and icon (from the backend) plus a distinct glyph shape, matching the app's marker language.
- Density: compact tables, comfortable 44 px minimum touch targets on interactive controls, sticky table headers, skeleton loading instead of spinners, short fade or slide transitions only.
- Brand: small wordmark "INZAR" with the orange diamond mark, in the sidebar header. App name comes from `NEXT_PUBLIC_APP_NAME` (default "Inzar").

## 5. Architecture

Feature-first structure with strict boundaries:

```
inzar-admin/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx            # shell: sidebar, topbar, role-aware nav
│   │   │   ├── page.tsx              # overview
│   │   │   ├── incidents/ (+ [id])
│   │   │   ├── queue/
│   │   │   ├── map/
│   │   │   ├── flags/
│   │   │   ├── users/ (+ [id])
│   │   │   ├── categories/
│   │   │   ├── settings/
│   │   │   ├── audit-log/
│   │   │   └── jobs/
│   │   └── api/
│   │       ├── auth/ (login, logout, session)   # BFF route handlers
│   │       └── proxy/[...path]/route.ts          # authenticated pass-through to the backend
│   ├── features/<name>/{components,hooks,api,schemas,lib}   # one folder per area above
│   ├── components/{ui,layout,data-table,filters,status}
│   ├── lib/{api,auth,env,format,permissions,utils}
│   ├── mocks/                  # MSW handlers matching the backend contract
│   └── middleware.ts           # route protection and role gating
├── e2e/, docs/, public/, Dockerfile, .env.example, CLAUDE.md
```

Rules:

- Pages are thin. Logic lives in `features/*`. A feature never imports another feature's internals; shared pieces go in `components/` or `lib/`.
- Every API call goes through the generated typed client. No `any`, no hand-typed response shapes that duplicate the spec.
- **Auth uses a BFF pattern:** the browser never sees backend tokens. The login route handler calls the backend, stores the access and refresh tokens in an **httpOnly, Secure, SameSite=Lax** encrypted cookie (use `jose`), and the `/api/proxy` handler attaches the bearer token server-side. Refresh must be **single-flight** (concurrent requests share one refresh) because the backend rotates refresh tokens and revokes the family on reuse. Verify `Origin` on state-changing proxy requests.
- Roles come from the backend: `moderator` and `admin`. Plain `user` accounts must be rejected at login. Gate in middleware, in navigation, and again on each page and action (defense in depth). Moderators can moderate incidents and flags; only admins can manage users' roles, categories, settings and view jobs.
- Loading, empty and error states are required on every data view. Errors use the backend's uniform shape `{"error": {"code", "message", "details"}}` and are shown as short, actionable, non-technical messages.

## 6. Backend contract

The backend is FastAPI under `/api/v1`. Its OpenAPI spec is at `${API_BASE_URL}/openapi.json`. **At the start of Phase 0, fetch it** and generate types (`pnpm gen:api`). Do not guess shapes when the spec exists.

Endpoints the backend is specified to provide (admin and moderation):

`POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /me`; `GET/POST/PATCH /admin/categories`; `GET/PATCH /admin/settings`; `GET /admin/moderation/queue`; `POST /admin/moderation/{id}/approve`; `POST /admin/moderation/{id}/reject` (reason required); `GET /admin/flags`; `PATCH /admin/flags/{id}`; `GET /admin/users`; `PATCH /admin/users/{id}` (suspend, role); `GET /admin/stats/overview`; `GET /admin/audit-log`; `GET /admin/jobs` plus retry.

**Known gaps this dashboard needs the backend to add.** Check the real spec. For anything missing, (a) write the exact contract you need into `docs/backend-gaps.md` (method, path, query and body parameters, response shape, permission, audit behavior), and (b) build against **MSW mocks that implement that contract**, switchable with `NEXT_PUBLIC_USE_MOCKS=true`, so the UI is complete and testable now and switches to the real backend by flipping the flag.

Required capabilities:

- `GET /admin/incidents`: list **all** incidents regardless of review or lifecycle status, with filters (`review_status`, `lifecycle_status`, `category_id`, `created_from`, `created_to`, `q` text search, `flagged` bool, `reporter_id`, `has_media`, `near` lat/lng/radius\_km or bbox, `removed` bool), sorting, and cursor pagination. Reporter identity and exact location are omitted unless revealed.
- `GET /admin/incidents/{id}`: full detail including media, status history, flags, moderation decisions.
- `POST /admin/incidents/{id}/mark-false`: body `{reason}`. Outcome: hidden from the map, status shown as **False report**, recorded against the reporter's moderation history.
- `POST /admin/incidents/{id}/remove` and `.../restore`: body `{reason}`. Soft removal (hidden from public, media scheduled for deletion after a retention window); restore reverses it inside that window.
- `POST /admin/incidents/{id}/resolve`: mark resolved.
- `POST /admin/incidents/{id}/rereview`: re-queue AI/manual review.
- `POST /admin/incidents/{id}/reveal-reporter` and `.../reveal-location`: body `{reason}`; each returns the data and writes an audit entry.
- `POST /admin/incidents/bulk`: `{ids[], action, reason}` for approve, reject, mark-false, remove (max 100, partial-success response).
- `GET /admin/users/{id}`: profile summary, counts by incident status, flags received, moderation history; `GET /admin/users/{id}/incidents`; `POST /admin/users/{id}/revoke-sessions`.
- `GET /admin/stats/overview` supporting `period` and breakdowns by status, category and time, plus alerts sent counts and job backlog.

Handle bulk partial failures explicitly (show which items failed and why).

## 7. Feature specification

**Overview.** Cards for queue size (links to the queue), incidents by status, new incidents in the selected period, flags awaiting action, active users, alerts sent, job backlog and failures. Charts: incidents over time, by category, by review outcome. Period selector (24 h, 7 d, 30 d). Everything links through to the matching pre-filtered list.

**Incidents (all).** Server-side table: thumbnail, category chip, title, review badge, lifecycle badge, flag count, place label, reported time, age. Columns can be shown or hidden and the choice is remembered. Filter panel (also available as removable filter chips above the table): review status, lifecycle status, category (multi), date range with presets, free-text search, flagged only, has media, removed included, reporter, and **location filter** (draw a radius on a small map or enter coordinates plus radius). Sorting by reported time, flag count, status. **Saved views**: an admin can save, name, rename, delete and set a default filter set (stored per admin, persisted via the backend if a preferences endpoint exists, otherwise `localStorage`; note the gap). All filter state is mirrored in the URL so views can be shared and the back button works. Row actions menu and multi-select with a bulk action bar.

**Incident detail** (a full page, also openable as a side drawer from lists). Layout: large photo with zoom, category and title, badges, description, timeline (submitted, uploaded, review result, moderator decisions, flags, resolution), map with the **fuzzed public location** (exact location behind a Reveal button that asks for a reason), reporter card hidden behind a Reveal button (reason required, audited, auto-hides on leave), flags list with notes, and an actions bar: **Approve, Reject, Mark as false, Remove, Restore, Mark resolved, Re-run review**, enabled only when valid for the current state. Each action opens a confirmation dialog with a required reason (preset reasons plus free text) and shows the resulting status afterwards. Show last updated, last confirmed, expiry and age indicators.

**Moderation queue.** A focused, keyboard-first review workflow for `needs_review` items: large photo, description, category, location context, flags, and decision buttons. Shortcuts: `A` approve, `R` reject, `F` mark false, `J`/`K` next/previous, `?` shortcut help. Reject and mark-false open a quick reason picker. Optimistic advance to the next item with undo for a few seconds only for approve (reject, false and remove are never undone silently). Shows queue length, oldest item age, and filters by category.

**Map.** All incidents on a MapLibre map with clustering, category-colored markers using the app's glyph shapes, a selected-marker highlight and a preview side panel with the same actions. Shares the incident filters (including status, so moderators can see pending and removed items too). Use fuzzed coordinates only.

**Flags.** List of user flags (incorrect, abuse, resolved) grouped by incident, with counts of distinct flaggers, filter by type and state, and actions: open incident, dismiss flag, move incident to review, mark false.

**Users.** Server-side table: display name, email (visible to admins only), role, verified, suspended, created, report counts. Filters: role, suspended, verified, created range, text search. Detail page: summary, counts by incident status, moderation history (false reports, rejections), flags received, session info, their incidents (opening them respects the privacy reveal rules). Actions: suspend and unsuspend with required reason, change role (admin only, with a clear confirmation), revoke sessions. A user cannot demote or suspend themselves, and the last admin cannot be demoted (enforce in the UI and expect the backend to enforce it too). No user deletion UI unless the backend supplies an endpoint.

**Categories (admin).** List with color, icon, active state and order; drag to reorder. Create and edit form covering every tunable: `slug` (immutable after creation), `name`, `icon_key`, `color_hex`, `is_active`, `sort_order`, `urgency` (routine or high), `default_ttl_minutes`, `stale_after_minutes` (must be less than TTL), `resolve_flag_threshold`, `notify_throttle_minutes`, `notify_by_default`, `require_manual_review`, `safety_note`. Live preview of the marker and chip. Categories in use can only be deactivated, never deleted. Validate with Zod mirroring backend rules.

**Settings (admin).** Typed form for global settings: `max_search_radius_km`, `allowed_radius_options_km`, `fuzz_distance_m`, `max_reports_per_user_per_hour`, `max_description_length`, `review_mode` (`auto_approve` or `manual`, with a prominent explanation and a confirm step), `abuse_flag_hide_threshold`, `alert_digest_threshold`, `alert_digest_window_minutes`, `min_account_age_minutes_to_report`. Show each setting's description, default, last updated time and who changed it, a dirty-state bar with Save and Discard, and a "reset to default" per setting.

**Audit log (admin).** Filterable table (actor, action, target type and id, date range) with an expandable before and after diff. Targets link to their pages. Read-only.

**Jobs (admin).** Dead-lettered and failed background jobs with type, attempts, last error and timestamps; retry action with confirmation; backlog counters.

**Account.** The signed-in admin's name, role, sign out, and theme switch in the topbar menu. Session expiry sends the user to login with a return URL.

## 8. Quality requirements (every phase)

- **Accessibility:** WCAG AA contrast in both themes, full keyboard operation, visible focus rings, labelled icon buttons, status never conveyed by color alone, `axe` checks on every page in the Playwright suite with zero violations.
- **Performance:** server-side pagination everywhere, debounced search (300 ms), virtualize any list that can exceed 200 rows, lazy-load images with Cloudinary sized transforms through `next/image` (configure `remotePatterns` from env), dynamic-import MapLibre and charts. Target Lighthouse performance 90 or above on list pages.
- **Security:** strict security headers and CSP (allow Cloudinary and the map style host), no tokens in `localStorage`, no secrets in client bundles, input validation with Zod on every form, CSRF-safe state changes, session idle timeout, no PII in logs or analytics, `X-Robots-Tag: noindex` on everything.
- **Responsive:** desktop-first (1280 px and up), fully usable on tablet; on narrow screens tables become card lists and the sidebar becomes a drawer.
- **Testing policy:** each feature needs unit or component tests for logic and forms, and Playwright flows for the user-visible behavior. Use MSW for deterministic data. Mocks must implement the same contract as the real backend, including error shapes, 403 on role violations, partial bulk failures and 409/410 conflicts.

## 9. Build phases

### Phase 0: Foundation

**Build:** create the Next.js project with the stack above; Tailwind tokens and theme (dark and light) per section 4; fonts; shadcn/ui installed and themed; base components (button, input, select, dialog, drawer, tooltip, toast, badge, skeleton, empty state, error banner); the shared `StatusBadge`, `CategoryChip` and `DataTable` building blocks; env validation with Zod (`src/lib/env.ts`) and `.env.example` (`API_BASE_URL`, `NEXT_PUBLIC_APP_NAME`, `SESSION_SECRET`, `NEXT_PUBLIC_USE_MOCKS`, `NEXT_PUBLIC_MAP_STYLE_URL`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`); OpenAPI generation script and typed client; MSW setup for browser, node and Playwright; `CLAUDE.md`, ESLint, Prettier, husky; CI workflow file; `docs/backend-gaps.md` started from section 6.

**Test and verify:** the app builds and starts; a component gallery route (dev only) renders every base component in both themes; unit tests for `StatusBadge` and `CategoryChip`; contrast check of the tokens; `pnpm gen:api` succeeds against the live spec or a checked-in snapshot; MSW intercepts in all three environments.

### Phase 1: Authentication and app shell

**Build:** login page (email and password, error states, loading, return URL); BFF route handlers for login, logout and session; encrypted httpOnly cookie sessions with `jose`; the single-flight refresh logic; the proxy route; role gating in middleware; reject non-staff accounts with a clear message; the dashboard shell (collapsible sidebar with role-aware navigation and the orange active marker, topbar with search placeholder, account menu, theme toggle, breadcrumbs); 403, 404, 500 and session-expired pages; idle timeout.

**Test and verify:** unit tests for session sealing, refresh single-flight (concurrent calls cause exactly one refresh), and role helpers; Playwright: login success for moderator and admin, wrong password, `user` role rejected, protected route redirects to login and returns after sign in, moderator cannot open admin-only pages (redirect plus hidden nav), logout clears the session, expired session recovery, theme persistence. Confirm via DevTools-level test that no token is readable from client JavaScript.

### Phase 2: Incidents list and filtering

**Build:** `GET /admin/incidents` integration with the data table; the filter panel, filter chips and the location filter with a mini map; sorting; cursor pagination; column visibility; saved views (create, rename, delete, default) with URL-synced state through `nuqs`; skeleton, empty and error states; row action menu shell; responsive card layout; MSW handlers with a seeded dataset of 500+ incidents spanning every status.

**Test and verify:** each filter alone and combined returns the right rows (mock and component tests); URL round-trip (reload and back button restore the exact view); saved view lifecycle; pagination and sorting; empty and error states; Playwright flows for filter, save view, share URL; axe passes; verify only changed requests fire when filters change (no request storms).

### Phase 3: Incident detail and moderation actions

**Build:** the incident detail page and drawer per section 7; photo viewer with zoom; timeline; flags list; map with the fuzzed location; audited reveal flows for reporter and exact location (reason dialog, auto-hide on navigation); all actions (approve, reject, mark false, remove, restore, resolve, re-run review) with state-aware enabling, required-reason confirmation dialogs, preset reasons, success and failure toasts, and cache invalidation; bulk action bar on the list with partial-failure reporting; permission checks.

**Test and verify:** for every action, a test of the valid-state transition, the invalid-state disabled button, required reason validation, 403 handling, 409/410 conflict handling and list and detail cache refresh; reveal flows (reason required, data hidden again after navigation, nothing persisted); bulk action partial failure UI; Playwright journey: open an incident from the list, mark false with a reason, see it disappear from the default view and appear under the False report filter, restore a removed incident.

### Phase 4: Moderation queue and flags

**Build:** the focused queue screen with keyboard shortcuts and help overlay; quick reason picker; undo for approve only; queue stats; the Flags page with grouping, filters and actions; deep links from flags and the overview to the correct pre-filtered view.

**Test and verify:** keyboard-only Playwright run that clears a queue of 10 mixed items (approve, reject, false) without touching the mouse; shortcut handling is disabled while typing in inputs; undo window behavior; empty queue state; flags filtering and actions; axe passes in the queue (focus management after each decision is correct).

### Phase 5: Map view

**Build:** the MapLibre map page with clustering, category markers and selected highlight, shared filters, and the preview panel with actions; viewport-driven fetching with debounce; map style configurable from env with a dark Inzar style default and a light style for the light theme; accessible alternative (list of visible incidents next to the map).

**Test and verify:** clusters split and merge on zoom; filters change markers; selecting a marker opens the panel and keeps map position; performance with 5,000 mocked incidents stays smooth (record the frame behavior notes); only fuzzed coordinates are ever used; keyboard access to the incident list alternative.

### Phase 6: Users

**Build:** users table with filters and search; user detail page (summary, counts, moderation history, flags received, their incidents); actions: suspend and unsuspend with reason, change role (admin only), revoke sessions; self-protection and last-admin rules; email visibility restricted to admins.

**Test and verify:** table filters and search; each action with reason validation and permission matrix (moderator cannot change role or see admin-only fields); cannot suspend or demote yourself; last-admin guard; Playwright journey: find a user by email, review their moderation history, suspend them, see the badge update.

### Phase 7: Categories and settings

**Build:** the categories list with drag-and-drop reorder; create and edit form with all tunables, immutable slug, Zod rules mirroring the backend (`stale_after_minutes` below `default_ttl_minutes`, valid hex, positive numbers), live marker and chip preview, deactivate and reactivate; the settings page with typed fields, per-setting help, dirty-state bar, reset to default, last-changed metadata, and the confirmed `review_mode` switch.

**Test and verify:** every validation rule has a failing and passing test; reorder persists; creating a category makes it appear in the incident filters; deactivation rules; unsaved-changes guard on navigation; settings save, discard and reset; Playwright journey: add a new category with custom TTL, then change `review_mode`, with the audit entries visible afterwards (next phase).

### Phase 8: Overview, audit log and jobs

**Build:** the overview with stat cards, period selector and charts, each linking to a pre-filtered list; the audit log table with filters and the expandable before and after diff, linking to targets; the jobs page with failed and dead-lettered jobs, retry with confirmation, and backlog counters.

**Test and verify:** stats render from seeded data and match (cards equal the sum of the breakdowns); chart components handle empty and large values; audit filters and diff rendering for all action types created in earlier phases; job retry flow; admin-only gating for jobs and audit log; Playwright overview-to-list drill-downs.

### Phase 9: Hardening and deployment

**Build:** security header and CSP review; accessibility pass across every page in both themes; performance pass (bundle analysis, dynamic imports, image sizes, virtualization where needed); error boundaries and global error reporting hook (Sentry-compatible, optional by env); a production Dockerfile (multi-stage, non-root, standalone output); Vercel config notes and Render service notes in `docs/DEPLOYMENT.md`; `docs/ARCHITECTURE.md` and a finalized `docs/backend-gaps.md`; remove dev-only routes from production builds; run the whole suite against the **real backend** (flag mocks off) and list any contract mismatches.

**Test and verify:** full Playwright regression across all journeys in both themes; axe zero violations on all pages; Lighthouse results recorded; production build starts from the container and passes a smoke test; confirm no secret in the repo, bundle or logs; dependency audit run and findings fixed or documented.

## 10. Hard constraints

- Never expose reporter identity or exact coordinates without an explicit, reasoned, audited reveal, and never persist revealed data client-side.
- Never store backend tokens where client JavaScript can read them.
- Never present a report as verified or confirmed unless the backend's label says so, and never show invented scores.
- Destructive actions always require a reason and confirmation. Remove is a soft removal that can be restored.
- Never hardcode categories or settings. Read them from the API.
- Do not add social features, public pages, or analytics that profile individual reporters.
- Do not use `any`, disable lint rules to pass checks, or skip tests.
- Do not implement features whose backend endpoints do not exist except through the documented mock contract.

Begin with Phase 0. When it is complete and verified, write its report, commit, and continue to Phase 1.
