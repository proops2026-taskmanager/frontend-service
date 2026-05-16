# frontend-service — Agent Context

---

## What This Service Does

`frontend-service` is the React SPA that users interact with.
- Login page → calls POST /auth/login through api-gateway, stores JWT in localStorage key `auth_token`
- Task list page → fetches GET /tasks, displays with status badges
- Create task page → calls POST /tasks
- Task detail page → fetches GET /tasks/:id, shows comments, status selector
- Served by nginx alpine on port 3000

**Port:** 3000 (exposed to host, separate from api-gateway)
**No backend logic.** All API calls go through api-gateway on port 8080.

---

## Governing Document

**IRD-004** is the law for this service. Read it before writing any code.

| Location | URL |
|----------|-----|
| Local (docs repo) | `../docs/IRD-004.md` |
| Notion | https://www.notion.so/342dde5fafa9812f99bff829422341b9 |

---

## Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Dev server + bundler |
| nginx | alpine | Production static file server |

---

## API Contract (what this service calls)

All calls go to `http://localhost:8080` (api-gateway). Include `Authorization: Bearer <token>` header on protected routes.

| Action | Method + Path | Auth |
|--------|--------------|------|
| Login | POST /auth/login | No |
| Get tasks | GET /tasks | Yes |
| Create task | POST /tasks | Yes |
| Get task detail | GET /tasks/:id | Yes |
| Update status | PATCH /tasks/:id/status | Yes |
| Add comment | POST /tasks/:id/comments | Yes |

---

## Locked Standards

| Decision | Value |
|----------|-------|
| JWT storage | localStorage key `auth_token` |
| API base URL | `VITE_API_URL` env var (default `http://localhost:8080`) |
| CORS | Handled by api-gateway — frontend just sends requests |
| Error display | Show `error` field from response body: `{ "error": "..." }` |
| Auth guard | Redirect unauthenticated users to /login |

---

## Sprint 2 Task Assignments

| Task | Description | Owner |
|------|-------------|-------|
| F-01 | Scaffold frontend-service (Vite + React + TS) | chau_tv |
| F-02 | LoginPage + AuthGuard + token storage | thai_dm |
| F-03 | TaskListPage — fetch and display tasks | chau_tv |
| F-04 | CreateTaskPage — form + POST /tasks | chau_tv |
| F-05 | TaskDetailPage — detail view + comments | thai_dm |
| F-06 | StatusSelector component | thai_dm |
| F-07 | CommentForm component | thai_dm |
| F-08 | Docker + nginx config + CORS wiring | thai_dm |
| F-09 | Component tests | chau_tv |

---

## Session Startup

When opening a session in this repo:
1. Read IRD-004 from Notion (link above)
2. Check Linear for open F-XX tasks assigned to you
3. Check `src/` structure — components go in `src/components/`, pages in `src/pages/`
4. API calls go in `src/api/` — one file per resource (auth.ts, tasks.ts)
