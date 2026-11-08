# Phase 1 Report: Authentication and App Shell

## 1. What Was Built
- **Authentication & Backend For Frontend (BFF)**:
  - `POST /api/auth/login`: Authenticates credentials with backend (or MSW), enforces staff-only role gating (rejects plain `user` accounts with 403), seals session into an **httpOnly, Secure, SameSite=Lax** encrypted cookie (`inzar_admin_session`) using `jose` AES-256-GCM.
  - `POST /api/auth/logout`: Clears session cookie and informs backend auth service.
  - `GET /api/auth/session`: Returns sanitized session metadata (`id`, `email`, `display_name`, `role`) without ever revealing JWT tokens to client JavaScript.
  - Single-flight token refresh (`src/lib/auth/refresh.ts`): Deduplicates concurrent refresh requests using in-flight promise memoization, protecting token family rotation against invalidation races.
  - Authenticated proxy route (`src/app/api/proxy/[...path]/route.ts`): Forwards requests to `${API_BASE_URL}`, verifies `Origin` header on state-changing methods (`POST`, `PUT`, `PATCH`, `DELETE`), handles transparent token refresh on 401s, and updates session cookie.
- **Middleware & Route Protection**:
  - `src/middleware.ts`: Intercepts unauthenticated navigation to dashboard routes and redirects to `/login?returnUrl=...`.
  - Role gating: Restricts admin-only areas (`/users`, `/categories`, `/settings`, `/audit-log`, `/jobs`) so moderators are rewritten to `/403`.
  - Redirects already-authenticated staff visiting `/login` back to the dashboard.
- **Login Experience (`src/app/(auth)/login/page.tsx`)**:
  - Inzar branding with signal orange diamond mark and bold bone typography.
  - React Hook Form + Zod validation with friendly validation messages.
  - Error banner handling bad credentials, unauthorized roles, session expiries, and network faults.
  - Wrapped in `<Suspense>` to enable instant client hydration.
  - Added `suppressHydrationWarning` and `method="post"` to insulate against browser extensions modifying input DOM attributes.
- **Dashboard Shell (`src/app/(dashboard)/layout.tsx`)**:
  - Collapsible desktop sidebar and responsive tablet/mobile drawer.
  - Signal orange active route marker indicator matching design.
  - Navigation grouped into operational items (Overview, Moderation queue with badge, Incidents, Map, Flags with badge) and role-gated ADMIN section (Users, Categories, Settings, Audit log, Jobs with badge).
  - User account menu in sidebar footer displaying user initials badge, full name, role, theme toggle, and sign out action.
  - Topbar with breadcrumb trail (`INZAR / OVERVIEW`), search placeholder with `/` shortcut badge, and theme switcher.
  - Overview page shell matching Page 1 of `Inzar Admin Dashboard.pdf` with primary KPI cards (Queue Size, New Incidents, Flags Awaiting Action, Job Failures with 'Needs retry' tag).
- **Error & Status Pages**:
  - `403` Forbidden page (`src/app/403/page.tsx`).
  - `404` Not found page (`src/app/not-found.tsx`).
  - `500` Error boundary (`src/app/error.tsx`).
  - Idle timeout detector (`src/components/layout/idle-timeout-tracker.tsx`) redirecting to login upon 30 minutes of inactivity.

## 2. Verification Commands & Results
- `pnpm lint`: Passed with 0 errors (`eslint .`).
- `pnpm typecheck`: Passed with 0 errors (`tsc --noEmit`).
- `pnpm test`: 6 test suites, 25 unit tests passed (Session JWE sealing/unsealing, single-flight refresh deduplication, role access matrix, status badge, category chips, WCAG contrast).
- `pnpm build`: Next.js production build succeeded with dynamic rendering for authenticated views and static rendering for public fallback routes.
- `pnpm test:e2e` (Playwright): 16/16 tests passed across desktop (1440px) and tablet (768px):
  - Unauthenticated redirect with `returnUrl` preservation.
  - Invalid credentials error display.
  - Non-staff user role rejection.
  - Admin login renders full sidebar with ADMIN navigation.
  - Moderator login hides ADMIN section and restricts access.
  - Moderator accessing `/users` blocked with 403.
  - DevTools check confirms 0 tokens in `localStorage`, `sessionStorage`, or readable cookies.
  - Sign out clears session and redirects to `/login`.
  - Screenshots captured for visual validation (`docs/screenshots/admin-dashboard-1440px.png` and `docs/screenshots/admin-dashboard-768px.png`).

## 3. Decisions & Adjustments
- Recorded in `docs/DECISIONS.md`:
  - Used Web Crypto API `CryptoKey` derivation for realm-agnostic JWE encryption.
  - Added `suppressHydrationWarning` and `method="post"` to `<form>` and `Input` to prevent browser extension attribute injection from triggering React hydration warnings.
  - Single-flight refresh keyed by refresh token in BFF layer to prevent concurrent token rotation conflicts.

## 4. Next Phase
- Phase 2: Incidents list and filtering (`GET /admin/incidents`, table, filters, location radius filter, saved views with `nuqs`, cursor pagination, and MSW dataset).
