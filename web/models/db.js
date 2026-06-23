'use strict';

const { DatabaseSync } = require('node:sqlite');

// In-memory database, re-seeded on every server start for deterministic data.
const db = new DatabaseSync(':memory:');

db.exec(`
  CREATE TABLE IF NOT EXISTS timesheet_entries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_name TEXT  NOT NULL,
    date          TEXT  NOT NULL,
    project       TEXT  NOT NULL,
    description   TEXT  NOT NULL,
    hours         REAL  NOT NULL
  );
`);

// Fixed, deterministic seed dataset (14 records -> exercises pagination at 10/page).
// Mirrored in tests/report.spec.ts as the source of truth for expected values.
const seedData = [
  { employee_name: 'John Doe',    date: '2026-06-01', project: 'Project A', description: 'Worked on feature X',            hours: 8.0 },
  { employee_name: 'Jane Smith',  date: '2026-06-02', project: 'Project B', description: 'Fixed bugs',                      hours: 6.5 },
  { employee_name: 'John Doe',    date: '2026-06-03', project: 'Project A', description: 'Code review',                     hours: 2.0 },
  { employee_name: 'Jane Smith',  date: '2026-06-04', project: 'Project C', description: 'Design meeting',                  hours: 3.0 },
  { employee_name: 'Alice Brown', date: '2026-06-05', project: 'Project B', description: 'Testing',                         hours: 5.0 },
  { employee_name: 'Bob Lee',     date: '2026-06-06', project: 'Project A', description: 'Deployment',                      hours: 4.0 },
  { employee_name: 'John Doe',    date: '2026-06-07', project: 'Project C', description: 'Documentation',                   hours: 1.5 },
  { employee_name: 'Jane Smith',  date: '2026-06-08', project: 'Project A', description: 'Refactor module',                 hours: 7.0 },
  { employee_name: 'Alice Brown', date: '2026-06-09', project: 'Project C', description: 'Research spike',                  hours: 6.0 },
  { employee_name: 'Bob Lee',     date: '2026-06-10', project: 'Project B', description: 'Bug fixing',                      hours: 3.5 },
  { employee_name: 'John Doe',    date: '2026-06-11', project: 'Project B', description: 'Feature Y implementation',        hours: 8.0 },
  { employee_name: 'Jane Smith',  date: '2026-06-12', project: 'Project C', description: 'Code review',                     hours: 2.5 },
  { employee_name: 'Alice Brown', date: '2026-06-13', project: 'Project A', description: 'Customer support',                hours: 4.5 },
  { employee_name: 'Bob Lee',     date: '2026-06-14', project: 'Project C', description: 'Planning meeting',                hours: 1.0 },
];

function seed() {
  const { c } = db.prepare('SELECT COUNT(*) AS c FROM timesheet_entries').get();
  if (c > 0) return;
  const insert = db.prepare(
    'INSERT INTO timesheet_entries (employee_name, date, project, description, hours) VALUES (?, ?, ?, ?, ?)'
  );
  for (const r of seedData) {
    insert.run(r.employee_name, r.date, r.project, r.description, r.hours);
  }
}

/** Clear all rows and restore the deterministic seed dataset (used for test isolation). */
function reset() {
  db.exec('DELETE FROM timesheet_entries');
  db.exec("DELETE FROM sqlite_sequence WHERE name = 'timesheet_entries'");
  seed();
}

seed();

module.exports = { db, seedData, reset };
