# BizManager V4.7 — Stabilisation

- Reworked shared workspace with a multi-product cart for sales and purchases.
- Fixed the TypeScript module configuration typing issue in WorkspaceClient.
- Added an application middleware redirect for protected pages when no session cookie exists.
- Fixed Documents page so unauthenticated users are redirected to /login instead of receiving a blank page.
- Added GET /api/health to diagnose PostgreSQL connectivity.
- API authorization remains server-side; the middleware is only a UX/session guard.
- PostgreSQL remains required for persistent data.
