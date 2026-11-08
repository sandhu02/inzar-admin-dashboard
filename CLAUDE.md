# Inzar Admin Dashboard - Developer Guidelines

Admin dashboard for Inzar, a real-time local incident reporting platform.
Used by admins and moderators. Not a public site; no social features.

## Operating Principles
- **Phase by Phase**: Follow Section 9 strictly. Verify each phase with lint, typecheck, test, build, and Playwright before moving on.
- **Verification Routine**: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, Playwright at 1440px and 768px.
- **Reporting & Commits**: After each phase, write `docs/phases/phase-N-report.md` and commit `phase N: <title>`.
- **Decisions**: Document non-obvious choices in `docs/DECISIONS.md`.
- **Backend Gaps**: Document missing backend endpoints in `docs/backend-gaps.md` and mock via MSW (`NEXT_PUBLIC_USE_MOCKS=true`).

## Technology Stack
- **Framework**: Next.js (App Router, RSC where useful), TypeScript (`strict`, `noUncheckedIndexedAccess`).
- **Styling**: Tailwind CSS with design tokens via CSS variables. Dark-first warm graphite.
- **Components**: shadcn/ui (Radix primitives), `lucide-react` icons.
- **State & Data**: TanStack Query v5, TanStack Table v8, `nuqs` (URL state), React Hook Form + Zod.
- **Maps & Charts**: MapLibre GL JS, Recharts.
- **Auth & API**: BFF with `jose` encrypted httpOnly cookie, single-flight refresh; typed client via `openapi-fetch`.
- **Theming & Dates**: `next-themes` (dark-first, light support), `date-fns` (local zone display, UTC tooltip).
- **Testing**: Vitest + Testing Library, MSW, Playwright + `@axe-core/playwright`.

## Visual Identity
- **Dark Theme**: BG `#12110F`, Surface `#1C1A17`, Elevated `#26231F`, Borders `#35312B`, Primary `#F2EDE4`, Secondary `#A8A094`.
- **Accent**: Signal Orange `#FF6B2C` (used sparingly: key highlights, active nav marker, fire category).
- **Status Colors**: Info `#7CC4FF`, Warning `#FFC14D`, Success `#6FD8A0`, Danger `#FF7B6E`.
- **Typography**: Schibsted Grotesk (UI), JetBrains Mono (IDs, timestamps, coords, status labels).
- **Badges**: Icon + text always. No standalone color coding.

## Architecture & Folder Rules
- `src/app/`: Thin pages and route handlers.
- `src/features/<name>/{components,hooks,api,schemas,lib}`: Domain-specific modules with strict boundaries.
- `src/components/{ui,layout,data-table,filters,status}`: Shared design system components.
- `src/lib/{api,auth,env,format,permissions,utils}`: Shared utilities, API client, BFF auth helpers.
- `src/mocks/`: MSW handlers for deterministic testing and gap coverage.

## Hard Constraints
- Never expose reporter identity or exact coordinates without an explicit, reasoned, audited reveal. Never persist reveal states.
- Never expose backend JWTs/tokens to client JavaScript (httpOnly encrypted session cookies only).
- Never invent verification scores. Display backend verification labels as-is.
- Require reason and confirmation dialog for destructive actions (reject, mark false, remove, suspend, role changes).
- Role gating: `admin` and `moderator` only; reject plain `user` accounts at login.
- Zero accessibility violations (`axe`), WCAG AA contrast, keyboard navigability.
