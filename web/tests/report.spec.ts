import { test, expect, type Page } from '@playwright/test';

/**
 * Source-of-truth seed dataset. Mirrors web/models/db.js exactly.
 * Used to compute expected values for the assertions below.
 */
const SEED = [
  { employee_name: 'John Doe',    date: '2026-06-01', project: 'Project A', hours: 8.0 },
  { employee_name: 'Jane Smith',  date: '2026-06-02', project: 'Project B', hours: 6.5 },
  { employee_name: 'John Doe',    date: '2026-06-03', project: 'Project A', hours: 2.0 },
  { employee_name: 'Jane Smith',  date: '2026-06-04', project: 'Project C', hours: 3.0 },
  { employee_name: 'Alice Brown', date: '2026-06-05', project: 'Project B', hours: 5.0 },
  { employee_name: 'Bob Lee',     date: '2026-06-06', project: 'Project A', hours: 4.0 },
  { employee_name: 'John Doe',    date: '2026-06-07', project: 'Project C', hours: 1.5 },
  { employee_name: 'Jane Smith',  date: '2026-06-08', project: 'Project A', hours: 7.0 },
  { employee_name: 'Alice Brown', date: '2026-06-09', project: 'Project C', hours: 6.0 },
  { employee_name: 'Bob Lee',     date: '2026-06-10', project: 'Project B', hours: 3.5 },
  { employee_name: 'John Doe',    date: '2026-06-11', project: 'Project B', hours: 8.0 },
  { employee_name: 'Jane Smith',  date: '2026-06-12', project: 'Project C', hours: 2.5 },
  { employee_name: 'Alice Brown', date: '2026-06-13', project: 'Project A', hours: 4.5 },
  { employee_name: 'Bob Lee',     date: '2026-06-14', project: 'Project C', hours: 1.0 },
];

const PAGE_SIZE = 10;

function summaryFor(rows: typeof SEED) {
  const totalHours = rows.reduce((s, r) => s + r.hours, 0);
  const activeProjects = new Set(rows.map((r) => r.project)).size;
  const developers = new Set(rows.map((r) => r.employee_name)).size;
  return {
    totalHours: totalHours.toFixed(1),
    activeProjects: String(activeProjects),
    billable: totalHours.toFixed(1),
    avgEntriesPerDev: (developers ? rows.length / developers : 0).toFixed(1),
  };
}

const rowCount = (page: Page) => page.getByTestId('report-row').count();

test.beforeEach(async ({ page }) => {
  await page.request.post('/__test/reset');
  await page.goto('/report');
});

test('TC001: page loads successfully with correct title', { tag: ['@high', '@feature01'] }, async ({ page }) => {
  await expect(page).toHaveTitle('Timesheet Report');
  await expect(page.getByTestId('page-title')).toHaveText('Timesheet Report');
});

test('TC002: data is displayed in table format', { tag: ['@high', '@feature01'] }, async ({ page }) => {
  await expect(page.getByTestId('report-table')).toBeVisible();
  const expectedRows = Math.min(PAGE_SIZE, SEED.length);
  expect(await rowCount(page)).toBe(expectedRows);

  // First seeded entry should appear (ordered by date asc).
  const firstRow = page.getByTestId('report-row').first();
  await expect(firstRow.getByTestId('cell-employee')).toHaveText('John Doe');
  await expect(firstRow.getByTestId('cell-date')).toHaveText('2026-06-01');
});

test('TC003: summary data is correct', { tag: ['@high', '@feature01'] }, async ({ page }) => {
  const expected = summaryFor(SEED);
  await expect(page.getByTestId('summary-total-hours')).toHaveText(expected.totalHours);
  await expect(page.getByTestId('summary-active-projects')).toHaveText(expected.activeProjects);
  await expect(page.getByTestId('summary-billable')).toHaveText(expected.billable);
  await expect(page.getByTestId('summary-avg-entries')).toHaveText(expected.avgEntriesPerDev);
});

test('TC004: filter by employee name', { tag: ['@high', '@feature01'] }, async ({ page }) => {
  await page.getByTestId('filter-employee').fill('John Doe');
  await page.getByTestId('filter-apply').click();

  const johnRows = SEED.filter((r) => r.employee_name === 'John Doe');
  expect(await rowCount(page)).toBe(Math.min(PAGE_SIZE, johnRows.length));

  for (const cell of await page.getByTestId('cell-employee').all()) {
    await expect(cell).toHaveText('John Doe');
  }
});

test('TC005: filter by date range', { tag: ['@high', '@feature01'] }, async ({ page }) => {
  const from = '2026-06-01';
  const to = '2026-06-02';
  await page.getByTestId('filter-date-from').fill(from);
  await page.getByTestId('filter-date-to').fill(to);
  await page.getByTestId('filter-apply').click();

  const expected = SEED.filter((r) => r.date >= from && r.date <= to);
  expect(await rowCount(page)).toBe(expected.length);

  for (const cell of await page.getByTestId('cell-date').all()) {
    const value = (await cell.textContent())?.trim() ?? '';
    expect(value >= from && value <= to).toBeTruthy();
  }
});

test('TC006: pagination works correctly', { tag: ['@high', '@feature01'] }, async ({ page }) => {
  // More than 10 records -> at least 2 pages.
  await expect(page.getByTestId('pagination')).toBeVisible();
  const totalPages = Math.ceil(SEED.length / PAGE_SIZE);
  expect(await page.getByTestId('pagination-page').count()).toBe(totalPages);

  // Page 1 shows a full page.
  expect(await rowCount(page)).toBe(PAGE_SIZE);
  await expect(page.getByTestId('pagination-info')).toContainText(`of ${SEED.length} entries`);

  // Navigate to page 2 -> remaining records.
  await page.getByTestId('pagination-next').click();
  await expect(page).toHaveURL(/page=2/);
  expect(await rowCount(page)).toBe(SEED.length - PAGE_SIZE);
});
