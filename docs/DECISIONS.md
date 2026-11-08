# Architecture and Implementation Decisions

Record of engineering decisions made during development.

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-11-08 | Use `src/` directory structure | Aligns with Section 5 architecture specification and separates app code from repo configs. |
| 2026-11-08 | BFF session with `jose` AES-256-GCM encryption | Protects backend tokens from client-side script access (XSS mitigation) while enabling single-flight token rotation. |
| 2026-11-08 | MSW v2 for mock interception | Enables full fidelity offline development and Playwright E2E testing mirroring backend contract gaps. |
| 2026-11-08 | Tailwind CSS v4 with custom theme tokens via CSS variables | Provides zero-runtime design tokens matching the Inzar warm graphite aesthetic. |
