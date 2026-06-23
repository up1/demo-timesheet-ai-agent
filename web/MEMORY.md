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
