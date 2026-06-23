# MEMORY.md — Project Notes

## Feature: Timesheet Report (`/report`)

Implemented from `spec/1_report/spec_report_page.md` and `template_report_page.html`.

### Stack
- Node.js 22+ (built-in `node:sqlite` `DatabaseSync`), Express 5, EJS, Playwright.
- In-memory SQLite, re-seeded on every server start for deterministic data.

### Project structure (`web/`)
```
app.js                      # Express entry point; / -> redirect to /report
models/db.js                # SQLite connection + schema + fixed seed (14 rows)
models/timesheetModel.js    # Query helpers: getCount, getRows, getSummary (filterable)
controllers/reportController.js  # Builds view model: rows, summary, pagination
routes/reportRoutes.js      # GET /report
views/report.ejs            # Report page
views/partials/head.ejs     # <head> incl. Tailwind CDN config from template
views/partials/sidebar.ejs  # Shared side nav
tests/report.spec.ts        # Playwright tests (TC001–TC006)
```

### Data model — `timesheet_entries`
`id, employee_name, date (YYYY-MM-DD), project, description, hours (REAL)`

### Behaviour
- Table columns: Employee Name, Date, Project, Description, Hours.
- Summary cards (respect active filters):
  - Total Hours = SUM(hours)
  - Active Projects = COUNT(DISTINCT project)
  - Billable = SUM(hours) — no billable flag in schema, all hours treated as billable.
  - Avg Entries/Dev = total entries / COUNT(DISTINCT employee_name)
- Filters (GET query params): `employee` (LIKE), `from`/`to` (date range). Reset = link to `/report`.
- Pagination: 10 rows/page via `?page=N`; page clamped to valid range.

### Seed data
14 deterministic records (4 developers, projects A/B/C, dates 2026-06-01..14).
Expected full-dataset summary: Total 62.5, Projects 3, Billable 62.5, Avg 3.5.
Seed array is mirrored in `tests/report.spec.ts` as the source of truth.

### Key test IDs
`page-title`, `summary-total-hours`, `summary-active-projects`, `summary-billable`,
`summary-avg-entries`, `filter-employee`, `filter-date-from`, `filter-date-to`,
`filter-apply`, `filter-reset`, `report-table`, `report-row`, `cell-employee`,
`cell-date`, `cell-project`, `cell-description`, `cell-hours`, `pagination`,
`pagination-prev`, `pagination-next`, `pagination-page`, `pagination-info`.

### Run
- Start: `npm start` (http://localhost:3000 -> /report)
- Test: `npm test` (Playwright auto-starts the server via `webServer` config)

### Test status
All 6 tests pass (TC001–TC006), tagged `@high @feature01`.

### Notes / gotchas
- `node:sqlite` prints an ExperimentalWarning — harmless.
- Spec wording says "filter by Customer name" but the schema/test data use
  `employee_name` (test filters by "John Doe"), so the filter is by employee.

---

## Feature: Add Data (`/add`)

Implemented from `spec/2_add_data/spec_add_data.md` and `template_add_data.html`.

### Files added/changed
```
controllers/addController.js  # getAddForm + postAddEntry (validation + persist)
routes/addRoutes.js           # GET /add, POST /add
routes/testRoutes.js          # POST /__test/reset (non-production only)
views/add.ejs                 # Add Timesheet Entry form (from template)
models/db.js                  # + reset() to reseed for test isolation
models/timesheetModel.js      # + createEntry(), getRecent()
app.js                        # + express.urlencoded, add/test routes
views/partials/sidebar.ejs    # active-state aware; Add Entry/New Entry -> /add
tests/add.spec.ts             # Playwright tests (TC001–TC010, @feature02)
```

### Behaviour
- `GET /add`: renders the form (title "Add Timesheet Entry"), recent entries,
  and total entry count.
- `POST /add`: validates, persists, then `302` redirect to `/report`.
  On validation failure: re-renders `/add` with `400`, inline errors, and
  preserved values (no redirect).

### Field -> column mapping
Form fields are Date, Hours Spent, Customer, Project, Task Description.
The schema has no Customer column, so (consistent with the report feature)
the **Customer value is stored in `employee_name`**.
- Date -> date, Hours Spent -> hours, Project -> project,
  Task Description -> description, Customer -> employee_name.

### Validation rules (server-side; no HTML `required`, so tests hit the server)
| Field            | Rule                          | Error message                          |
|------------------|-------------------------------|----------------------------------------|
| Date             | Required                      | Date is required                       |
| Hours Spent      | Required, positive number     | Hours spent must be a positive number  |
| Customer         | Required                      | Customer is required                   |
| Project          | Required                      | Project is required                    |
| Task Description | Optional, must be a string    | Task description must be a string       |

### Key test IDs
`page-title`, `add-form`, `input-date`, `input-hours`, `input-customer`,
`input-project`, `input-description`, `submit-entry`, `cancel-entry`,
`error-date`, `error-hours`, `error-customer`, `error-project`,
`error-summary`, `entry-count`, `recent-list`, `recent-item`,
`nav-add-entry`, `nav-new-entry`.

### Test isolation
In-memory SQLite is shared across tests in a run. `POST /__test/reset`
(guarded by `NODE_ENV !== 'production'`) reseeds the 14-row dataset; both
spec files call it in `beforeEach` so report count/summary assertions stay
deterministic regardless of rows added by the add tests.

### Test status
All 16 tests pass: report TC001–TC006 (`@feature01`) + add TC001–TC010
(`@feature02`).
