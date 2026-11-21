# Weekly Project Progress Tracker — MVP Scope

## 1. Product purpose

A lightweight tool for project managers to submit weekly progress updates, while giving project members visibility into the project's progress without needing to ask for updates in meetings or messages.

**Core focus:** monitoring project progress, not individual performance evaluation or task management.

## 2. Confirmed decisions

| Aspect | Decision |
|---|---|
| Purpose | Monitor project progress |
| Reporter | Project manager |
| Frequency | Weekly |
| Organization | One report per project per week |
| Report format | Fixed form |
| Report fields | Completed, In Progress, Pending |
| Report history | Preserved |
| Editing submitted reports | Not allowed |
| Report visibility | All project members |
| Submission permissions | Project manager only |

## 3. Remaining product decisions

### A. Project status

**Decision:** Manual status controlled by the project manager.

Statuses:
- **Active** — the project is ongoing.
- **Paused** — temporarily stopped.
- **Completed** — successfully finished.
- **Canceled** — discontinued.

**Why:** Progress reports alone cannot reliably determine whether a project is paused or finished. A project may have pending work and still be completed, or have no activity and still be active.

**Alternatives considered:**
- Automatically calculate status — unreliable.
- Use only Active/Completed — too restrictive.
- Allow free-text status — inconsistent and difficult to filter.

### B. Project structure

**Decision:** Each project has its own page.

Each project contains:
- Name
- Description
- Project manager
- Members
- Current status
- Weekly report history

**Why:** The project is the main organizational unit. Everything related to its progress should be accessible in one place.

**Alternatives considered:**
- A single global report feed — difficult to track individual projects.
- Organizing by team — teams may work on multiple projects.

### C. Weekly report fields

**Decision:** Three required text fields, with no word limit initially.

1. **Completed:** What was finished this week?
2. **In progress:** What is currently being worked on?
3. **Pending:** What remains to be done?

**Why:** These three fields provide enough information to understand the project's situation without turning reporting into bureaucracy.

**Alternatives considered:**
- One large text field — reports would lack consistency.
- More fields (risks, metrics, blockers, percentage completion) — increases reporting effort.
- Task-level tracking — turns the product into a project management tool.

The manager can write “None” or “Nothing this week” where appropriate.

### D. Weekly report uniqueness

**Decision:** One report per project per calendar week.

The system prevents a manager from submitting two reports for the same project and week.

**Why:** This keeps weekly history predictable and avoids duplicate entries.

**Alternatives considered:**
- Allow unlimited reports — creates fragmented history.
- Overwrite previous reports — conflicts with the decision to preserve historical records.

If a report is missing, the project shows that no report has been submitted for that week.

### E. Report corrections

**Decision:** Submitted reports cannot be edited or deleted in the MVP.

**Why:** Immutable reports preserve the historical record and simplify implementation.

**Alternatives considered:**
- Editable reports — history could silently change.
- Versioning — more complex data model and interface.
- Correction reports — potentially useful later, but unnecessary initially.

### F. Dashboard

**Decision:** A simple dashboard showing project status and recent reports.

The dashboard displays:
- Total projects
- Active projects
- Paused projects
- Completed projects
- Projects missing their weekly report
- Recent report submissions

**Why:** It should answer immediately: “What is happening across my projects, and which projects need attention?”

**Alternatives considered:**
- Charts and advanced analytics — unnecessary without enough historical data.
- Only a project list — makes it harder to spot problems.
- A complex productivity dashboard — risks introducing metrics that may not be meaningful.

### G. Notifications

**Decision:** No automated notifications in the MVP.

Managers can see missing weekly reports through the dashboard.

**Why:** Email reminders, notification preferences, and delivery infrastructure add complexity. Validate the reporting workflow first.

**Alternatives considered:**
- Weekly email reminders.
- In-app notifications.
- Notifications to members whenever a report is submitted.

These may be considered in a later version.

### H. Weekly period

**Decision:** Weeks run Monday through Sunday.

Each report belongs to a calendar week. The dashboard considers a report missing only after its reporting week has ended; the current week is still in progress.

**Why:** A standardized period makes reports comparable and avoids ambiguity about which days an update covers.

**Alternatives considered:**
- Rolling seven-day periods — different projects could have different reporting dates.
- Custom periods — flexible but unnecessarily complicated for the MVP.

### I. Permissions and users

**Decision:** Two basic roles.

| Role | Permissions |
|---|---|
| Project Manager | Manage the project, members, status, and submit reports |
| Member | View the project and its reports |

Each project has one manager, who can also be a member of that project.

**Why:** This is sufficient for the current workflow. More granular permissions would add complexity without a clear need.

**Alternatives considered:**
- Admin, supervisor, manager, member, viewer — too many roles initially.
- Everyone can submit reports — conflicts with centralized reporting.

## 4. Explicitly out of scope for the MVP

- Task management
- Kanban boards
- Individual performance evaluation
- Comments on reports
- Attachments
- Report editing and deletion
- Automated notifications
- Report approval workflows
- Charts and advanced analytics
- Integrations with Slack, Jira, Trello, etc.
- AI-generated reports

**Scope guardrail:** Do not gradually turn this into a Jira or Trello clone.

## 5. Core workflow

1. A manager creates a project.
2. The manager adds project members.
3. Members access the project and view its reports.
4. Every week, the manager submits a report.
5. The report records completed, in-progress, and pending work.
6. The report becomes immutable after submission.
7. The project maintains a chronological report history.
8. The dashboard highlights projects that haven't submitted their reports.

## 6. MVP summary

The MVP is a small project-progress reporting application with:
- Project creation and management
- Project membership
- Manual project status
- A weekly fixed-format report
- One report per project per week
- Immutable report history
- Member read access and manager write access
- A dashboard with project overview and missing-report visibility

## 7. Recommended next step

Before coding, define the **user flows and screens**:
- What the manager sees when entering the application
- How they open a project
- How they submit a weekly report
- How they view past reports

This makes the requirements concrete before choosing architecture or database schema.

## 8. Why this MVP is worth building

It is small enough to build as a real project, but substantial enough to practice:
- Authentication
- Authorization
- Relational data modeling
- Validation
- Frontend/backend integration
- Designing a clear workflow
