# Weekly Project Progress Tracker — Backlog

## 1. Set up the empty TypeScript project with a passing test
Goal: Create a runnable client/server project skeleton and confirm the test command passes.
Description: Set up the repository structure for a TypeScript browser client and a TypeScript Node.js/Express server, including package scripts and basic build configuration. Add one minimal automated test that passes without requiring a database or implementing product behavior.

## 2. Run PostgreSQL locally with Docker Compose
Goal: Provide a repeatable local PostgreSQL database for development.
Description: Add a Docker Compose service for PostgreSQL with a persistent data volume, health check, and configurable credentials. Add an `.env.example` and document how to start and stop the database without committing secrets.

## 3. Define the Prisma schema and initial migration
Goal: Create the database structure for users, projects, membership, reports, and refresh tokens.
Description: Define Prisma models for the five entities, their relationships, allowed project statuses, unique emails, unique project membership, and one report per project per week. Generate and apply the initial migration against the local Docker database, then document how to reset or migrate a development database.

## 4. Add shared request validation schemas
Goal: Validate signup, login, project, member, and weekly report inputs with Zod.
Description: Create focused Zod schemas for the API request payloads, including required fields, email format, status values, and non-empty report fields. Infer TypeScript types from the schemas and add tests for accepted and rejected examples.

## 5. Create the Express application foundation
Goal: Start an Express server with consistent JSON and error handling.
Description: Add the Express app, JSON body size limit, Helmet security headers, request logging with sensitive values redacted, and a centralized error response. Add a health endpoint and verify it responds without requiring authentication or database data.

## 6. Connect Prisma to the application server
Goal: Make the Prisma client available to server routes and services.
Description: Configure Prisma using the database URL from environment variables and create a managed client lifecycle for development and server shutdown. Add a small database connectivity check that reports a safe status without exposing credentials or raw database errors.

## 7. Implement self-service account registration
Goal: Allow a new user to create an account with a securely stored password.
Description: Add the signup endpoint using the shared Zod schema, normalize email consistently, and hash passwords with Argon2id before storing the user. Reject duplicate email addresses and add tests for successful registration, invalid input, and duplicate accounts.

## 8. Implement JWT login and access-token verification
Goal: Authenticate registered users and protect private API routes.
Description: Add a rate-limited login endpoint that verifies the Argon2id password hash and issues a short-lived JWT access token. Add authentication middleware that validates the token signature, expiry, issuer, and audience, and tests for valid, missing, expired, and invalid tokens.

## 9. Implement refresh-token rotation and logout
Goal: Keep users signed in safely and allow them to end a login session.
Description: Issue refresh tokens in secure, HTTP-only cookies and store only a hash or safe identifier in the refresh-token table. Implement refresh rotation and logout revocation, including reuse handling, cookie clearing, CSRF/origin protections, and tests for the token lifecycle.

## 10. Create and list accessible projects
Goal: Let signed-in users create projects and see projects they can access.
Description: Add endpoints to create a project and list projects where the user is the manager or a member. The creator becomes the manager and is added to project membership in the same database transaction; add tests for these access rules.

## 11. Read project details and report history
Goal: Let project members and managers view a project and its chronological reports.
Description: Add a project detail endpoint that returns project information, manager/member details, and report history ordered by reporting week. Reject access for users who are neither the manager nor members, and test both allowed and denied cases.

## 12. Manage project members
Goal: Let a project manager add or remove registered users as project members.
Description: Add manager-only endpoints for membership changes, prevent duplicate membership, and prevent removing the manager from their own project membership. Return clear errors for unknown users or projects and test manager and non-manager behavior.

## 13. Update project details and status
Goal: Let the project manager maintain project information and its manual status.
Description: Add a manager-only endpoint to update project name, description, and status using the defined Active, Paused, Completed, and Canceled values. Validate updates with Zod and test that members cannot make changes.

## 14. Submit one immutable report per project per week
Goal: Let only the project manager submit the weekly completed, in-progress, and pending report.
Description: Calculate the Monday week start on the server using the `America/Sao_Paulo` timezone and ignore any client attempt to choose a different reporting period. Enforce uniqueness on project and week, expose no report edit/delete endpoint, and test authorization and duplicate submissions.

## 15. Implement the dashboard data endpoint
Goal: Return project totals, status counts, latest-week missing reports, and recent submissions.
Description: Build an authenticated endpoint scoped to projects the signed-in user manages or belongs to. Mark active projects missing only when they have no report for the most recently completed Monday–Sunday week in `America/Sao_Paulo`, and test the week-boundary cases.

## 16. Build the Axios API client and shared browser foundation
Goal: Give the TypeScript frontend a consistent way to call the Express API.
Description: Set up the browser entry point, shared types for API responses, and a centralized Axios client for JSON requests and error handling. Keep access tokens in memory, include credentials only where refresh cookies require them, and avoid storing authentication tokens in localStorage.

## 17. Build signup, login, and logout screens
Goal: Let a user create an account, sign in, and sign out from the browser.
Description: Add accessible forms that call the authentication endpoints through the Axios client and display validation or authentication errors clearly. Keep authenticated state in the client and return signed-out users to the login screen after logout or refresh-token failure.

## 18. Build the project dashboard screen
Goal: Show the signed-in user the project overview and recent weekly reporting activity.
Description: Display total and status counts, active projects missing the latest completed week's report, and recent submissions using the dashboard endpoint. Include loading, empty, and error states without adding charts or analytics outside the MVP scope.

## 19. Build project list and project detail screens
Goal: Let users browse accessible projects and inspect one project's details and report history.
Description: Add project navigation and a detail view that shows the project status, manager, members, and chronological weekly reports. Show management controls only to the manager while keeping server-side authorization authoritative.

## 20. Build project creation and member-management forms
Goal: Let users create projects and managers maintain their project membership.
Description: Add a project creation form that makes the signed-in user the manager, plus manager-only controls for adding or removing registered users. Connect the forms to the API and present validation, success, and failure feedback.

## 21. Build the weekly report submission form
Goal: Let a project manager submit the fixed-format weekly report from the project page.
Description: Add required fields for Completed, In Progress, and Pending, with clear guidance that “None” is acceptable where appropriate. Handle duplicate-week submissions with a useful message and show the saved report in history after success.

## 22. Verify core permissions and reporting rules end to end
Goal: Confirm that the main project, membership, and weekly-report workflow works across browser, API, and database.
Description: Add focused integration coverage for signup, manager/member access, project visibility, one report per project per week, missing-report calculation, and immutable report behavior. Run the checks against a dedicated test database and document the commands needed to reproduce them.

## 23. Prepare deployment configuration and operating notes
Goal: Make the application deployable with secure configuration and recoverable data.
Description: Document required production environment variables, HTTPS assumptions, database migrations, backups, and separate development/production credentials. Configure a production build and safe startup/shutdown behavior without committing secrets or relying on a development database volume.
