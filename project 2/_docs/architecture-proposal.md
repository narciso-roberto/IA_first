# Weekly Project Progress Tracker — Architecture Proposal

## Purpose

This document proposes how to implement the MVP described in [`plan.md`](plan.md), using the selected Option 3: a TypeScript browser app, a Node.js/Express API, and PostgreSQL. It is a design proposal; it does not implement the application.

## Recommended architecture

Use a small **single-repository, three-layer web application**:

1. **Browser:** HTML, CSS, and TypeScript. The browser renders the dashboard, project pages, forms, and report history. Axios sends requests to the API.
2. **Application server:** Node.js with Express and TypeScript. It serves the browser files and provides JSON API endpoints. It validates requests, checks permissions, applies workflow rules, and accesses the database through Prisma ORM.
3. **Database:** PostgreSQL running in a Docker container for local development. It stores users, projects, project membership, and weekly reports. Database constraints enforce relationships and prevent duplicate project-week reports.

For the MVP, serve the frontend and API from the same Express origin. This avoids unnecessary CORS setup. Keep the frontend and API as separate folders in one repository, not separate deployable services. Docker Compose runs PostgreSQL locally; it does not replace the application host or imply that production must use a self-managed database container.

```text
Browser (HTML/CSS/TypeScript)
        │ same-origin HTTPS requests (JSON API)
        ▼
Node.js + Express + TypeScript
  ├─ authentication and authorization
  ├─ Zod request validation and business rules
  └─ Prisma ORM
        │
        ▼
PostgreSQL (Docker Compose locally)
```

## Technology choices

| Area | Proposed choice | Why it fits | Tradeoff / alternative |
|---|---|---|---|
| Language | TypeScript on both server and browser | Shared language and static types help keep API payloads and application data consistent. | Adds a compile/build step and requires learning TypeScript; this is accepted for clearer contracts and safer refactoring. |
| Frontend | Native HTML, CSS, and TypeScript modules | The planned screens are mostly forms, lists, and summaries. A UI framework is not required to build them. | React or Vue can help as interface complexity grows, but adds tooling and framework conventions. |
| HTTP client | Axios | Provides a consistent API client, JSON handling, interceptors, and centralized error handling. | Native `fetch` avoids a dependency, but Axios is selected per the project preference. |
| Server | Node.js with Express and TypeScript | Widely understood, small, and suitable for a JSON API plus static-file hosting. | A more structured framework may help a larger API, but would add conventions that the MVP does not need. |
| Database | PostgreSQL | The domain has clear relationships and integrity rules: users, projects, members, and reports. SQL constraints can enforce key rules. | A document database can be quick to start, but the relational model and uniqueness rules are more natural here. |
| Database access and schema | Prisma ORM with Prisma schema and migrations | Typed database client reduces repetitive query mapping and makes schema and migrations explicit. | Raw SQL may still be useful for specialized dashboard queries. Avoid a second data-access layer unless a query needs it. |
| Authentication | Short-lived JWT access token plus rotating refresh token in a secure, HTTP-only cookie | Meets the JWT requirement while keeping the long-lived refresh credential out of browser JavaScript. Use a maintained JWT library such as `jose`; validate signature, issuer, audience, and expiry. | JWT revocation is harder than server sessions. Refresh-token rotation and server-side refresh-token records add work but allow logout and revocation. Do not store tokens in `localStorage`. |
| Password storage | Argon2id password hashing | Passwords must never be stored as plain text or reversible encryption. Use a maintained Argon2 library and its recommended parameters. | bcrypt is a familiar alternative where Argon2 support is unavailable. |
| Request validation | Zod schemas at API boundaries | Produces clear validation rules for JSON fields. Infer TypeScript types from schemas to reduce mismatch between runtime validation and compile-time types. | Hand-written validation avoids a dependency but is easier to make inconsistent. |
| Security headers | Helmet | Provides sensible HTTP security headers with little application code. | Headers still need review when deployment and frontend behavior are known. |
| Local database | PostgreSQL in Docker Compose | Gives developers a repeatable PostgreSQL environment and keeps local setup consistent. | Production hosting remains a separate decision; a managed PostgreSQL service is the simplest default for deployment and backups. |
| Testing | Vitest for TypeScript tests, plus a test PostgreSQL database | TypeScript-aware test runner covers business rules and API behavior with familiar tooling. | Browser end-to-end testing can be added once main flows are implemented. |
| Other middleware | Helmet, `express-rate-limit`, and a structured logger such as Pino | Adds security headers, basic login/API throttling, and useful operational logs. | Configure limits and log redaction carefully; never record passwords, tokens, or sensitive request bodies. |

Dependencies should be pinned and reviewed when implementation begins. This proposal intentionally avoids prescribing versions, since supported releases change over time.

## Suggested repository layout

```text
project-root/
├─ client/
│  ├─ index.html
│  ├─ styles/
│  └─ src/                   # TypeScript UI modules and Axios client
├─ server/
│  ├─ src/
│  │  ├─ app.ts              # Express app and middleware
│  │  ├─ routes/             # HTTP endpoints
│  │  ├─ services/           # Workflow rules
│  │  ├─ db/                 # Prisma client
│  │  ├─ middleware/         # JWT, permissions, errors
│  │  └─ validation/         # Zod request schemas
│  └─ prisma/
│     └─ schema.prisma
├─ docker-compose.yml        # Local PostgreSQL service
├─ tests/
├─ .env.example
├─ package.json
└─ README.md
```

Keep route handlers thin: parse and validate input with Zod, call a service, then format the response. Put rules such as “only the project manager submits a report” and “a report cannot be changed after submission” in the service layer, with Prisma/database constraints backing up rules the database can enforce.

## Data model

The initial relational model can use five tables:

### `users`

- `id` — generated primary key
- `name`
- `email` — required and unique, normalized consistently
- `password_hash`
- `created_at`

### `projects`

- `id` — generated primary key
- `name`
- `description`
- `manager_id` — foreign key to `users`
- `status` — constrained to `active`, `paused`, `completed`, or `canceled`
- `created_at`, `updated_at`

### `project_members`

- `project_id` — foreign key to `projects`
- `user_id` — foreign key to `users`
- `created_at`
- Composite primary key `(project_id, user_id)` to prevent adding the same member twice.

The project manager can also be present in this membership table. Authorization treats the manager as having project access even if membership data is accidentally missing; project creation should add the manager as a member in the same transaction.

### `weekly_reports`

- `id` — generated primary key
- `project_id` — foreign key to `projects`
- `submitted_by` — foreign key to `users`
- `week_start` — SQL `DATE`, always the Monday for the report's Monday–Sunday period
- `completed`, `in_progress`, `pending` — required text fields
- `submitted_at` — timestamp stored consistently (UTC)
- Unique constraint `(project_id, week_start)` to enforce one report per project per week, even if two requests arrive at the same time.

### `refresh_tokens`

- `id` — generated primary key
- `user_id` — foreign key to `users`
- `token_hash` — hash of the refresh token, never the raw token
- `expires_at`, `revoked_at`, `created_at`
- Optional `replaced_by_id` to record token rotation.

This table allows logout and refresh-token reuse detection to revoke a credential without keeping a long-lived JWT in browser storage.

Prisma models map to these tables. Use Prisma migrations to create and change the schema. Add indexes for common lookups such as membership by user and report history by `(project_id, week_start)`, guided by actual queries.

## Weekly period and missing-report rule

Represent a reporting period by its Monday `week_start` date. The server calculates this date in the `America/Sao_Paulo` timezone (Brasília time) and must not trust a client-supplied date to decide whether a report is late. Persist the calendar date as a date-only value; store submission timestamps in UTC.

The dashboard marks a report missing for the **most recently completed Monday–Sunday week** only. The current week remains in progress. This is the simplest useful interpretation for the MVP and avoids an accumulating list of every historical omission. A query finds accessible active projects without a report for that completed week.

## API outline

All endpoints return JSON, use standard HTTP status codes, and require authentication except sign-in and sign-out.

| Method and path | Purpose | Access |
|---|---|---|
| `POST /api/auth/signup` | Create a user account | Public, rate-limited |
| `POST /api/auth/login` | Authenticate and issue JWT credentials | Public, rate-limited |
| `POST /api/auth/refresh` | Rotate the refresh token and issue a new access token | Valid refresh token |
| `POST /api/auth/logout` | Revoke the refresh token and clear its cookie | Signed in |
| `GET /api/auth/me` | Return the current user | Signed in |
| `GET /api/dashboard` | Return counts, missing reports, and recent submissions | Signed in; scoped to projects the user can access |
| `GET /api/projects` | List accessible projects | Signed in; scoped to membership/manager |
| `POST /api/projects` | Create a project and initial membership | Signed in |
| `GET /api/projects/:projectId` | Get details and report history | Project member or manager |
| `PATCH /api/projects/:projectId` | Update details or manual status | Project manager only |
| `PUT /api/projects/:projectId/members/:userId` | Add a member | Project manager only |
| `DELETE /api/projects/:projectId/members/:userId` | Remove a member | Project manager only; consider protecting manager membership |
| `POST /api/projects/:projectId/reports` | Submit the week's report | Project manager only |

Do not create report update or delete endpoints in the MVP. If the database ever needs administrative correction, handle that as a controlled operational process rather than a normal user action.

## Authentication and authorization

- Self-service sign-up creates a user account. The first signed-in user can create a project; its creator is that project's manager. Managers add other registered users as members. There is no separate workspace administrator in the MVP.
- Hash passwords with Argon2id; never store raw passwords.
- Issue a short-lived signed JWT access token and keep it in browser memory. Issue a longer-lived refresh token in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie in production. Persist a hash or identifier for refresh tokens in PostgreSQL, rotate on refresh, and revoke on logout. Sign JWTs with a strong secret or key held in environment/secret storage; validate signature, expiry, issuer, and audience.
- Protect refresh/logout and other cookie-authenticated state-changing requests against CSRF, and validate `Origin` where appropriate. Keep refresh and access token handling centralized in the Axios client; do not put tokens in `localStorage`.
- Use HTTPS in deployment; use environment variables or a secret manager for the database connection, JWT signing key, and refresh-token configuration. Commit only an `.env.example`, never real credentials.
- Check project access on every request. A user may read a project/report only if they are its manager or a member. Only the manager may change project details, membership, status, or submit a report.
- Never rely on hiding a button in the browser as an authorization check. The server must reject unauthorized requests.
- Let Prisma parameterize ordinary queries; use parameterized raw queries only when needed. Add request size limits, login/signup rate limiting, and safe error handling that does not expose SQL or secrets.

## Preserving report history

At the API level, create reports only; expose no edit or delete operation. The application database role should have only the permissions the app needs. The uniqueness constraint prevents duplicates. A future stronger immutability guarantee could add a database trigger that rejects updates and deletes, but that is additional complexity and should be decided deliberately. Project archival/deletion also needs a policy: hard-deleting a project would conflict with preserving its report history, so prefer retaining projects and changing their status to completed or canceled in the MVP.

## Dashboard queries

The dashboard can be assembled from a small number of Prisma queries (or a parameterized raw query if the aggregate is clearer):

- Count projects by status for projects the signed-in user can access.
- Find projects missing a report for the latest fully completed reporting week.
- Fetch the most recent reports with their project name and status.

Avoid charts or a generalized analytics layer for the MVP. Keep each query scoped by the current user’s manager/member relationship.

## Implementation sequence

1. Confirm user flows/screens and use `America/Sao_Paulo` for reporting weeks.
2. Create the TypeScript client/server structure, Express app, package scripts, and Docker Compose PostgreSQL service.
3. Define Prisma models and migrations; seed a small development dataset.
4. Implement self-service signup, login, JWT refresh/rotation, logout, and project-level authorization.
5. Implement project creation, membership, status, and project detail APIs.
6. Implement weekly report submission, uniqueness enforcement, and read-only history.
7. Build the dashboard and browser screens with the shared Axios API client.
8. Verify the key rules: members cannot submit, non-members cannot view, duplicate project-week submissions fail, and submitted reports cannot be changed through the app.
9. Deploy the app and database with HTTPS, backups, and separate development/production credentials.

## Decisions recorded

1. **Reporting timezone:** `America/Sao_Paulo` (Brasília time) defines the Monday–Sunday calendar week.
2. **Missing reports:** Show projects missing a report for the most recently completed week only. The current week is not marked missing.
3. **Accounts:** Self-service sign-up. A project creator becomes that project's manager; managers add registered users as members. There is no workspace administrator role in the MVP.

## Summary

The proposed MVP is a same-origin TypeScript/Express application backed by PostgreSQL, with Prisma for database access, Axios for browser API calls, and Docker Compose for local PostgreSQL. Express owns authentication, authorization, validation, and workflow rules; PostgreSQL owns durable relational data and integrity constraints. JWT access and refresh tokens support authentication, with refresh-token rotation and secure cookie storage for the refresh credential. This keeps the system small while placing permissions and the one-report-per-week rule where they can be enforced reliably.
