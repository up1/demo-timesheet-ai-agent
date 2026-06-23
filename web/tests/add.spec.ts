import { test, expect } from '@playwright/test';

/**
 * Tests for the "Add Data to Timesheet Report" feature (`/add`).
 * Spec: spec/2_add_data/spec_add_data.md
 *
 * Note: the schema has no Customer column; consistent with the report feature,
 * the Customer value is persisted in the `employee_name` column.
 */

const CUSTOMER = 'Acme Dynamics';
const PROJECT = 'Cloud Migration Phase II';

/** Fill the add form. Pass null to skip (leave a field untouched/empty). */
async function fillForm(
  page: import('@playwright/test').Page,
  data: { date?: string | null; hours?: string | null; customer?: string | null; project?: string | null; description?: string | null }
) {
  if (data.date != null) await page.getByTestId('input-date').fill(data.date);
  if (data.hours != null) await page.getByTestId('input-hours').fill(data.hours);
  if (data.customer != null) await page.getByTestId('input-customer').selectOption(data.customer);
  if (data.project != null) await page.getByTestId('input-project').selectOption(data.project);
  if (data.description != null) await page.getByTestId('input-description').fill(data.description);
}

test.beforeEach(async ({ page }) => {
  await page.request.post('/__test/reset');
  await page.goto('/add');
});

test('TC001: add page loads with correct title and form fields', { tag: ['@high', '@feature02'] }, async ({ page }) => {
  await expect(page).toHaveTitle('Add Timesheet Entry');
  await expect(page.getByTestId('page-title')).toHaveText('Add Timesheet Entry');

  await expect(page.getByTestId('input-date')).toBeVisible();
  await expect(page.getByTestId('input-hours')).toBeVisible();
  await expect(page.getByTestId('input-customer')).toBeVisible();
  await expect(page.getByTestId('input-project')).toBeVisible();
  await expect(page.getByTestId('input-description')).toBeVisible();
  await expect(page.getByTestId('submit-entry')).toHaveText('Submit Entry');
});

test('TC002: navigate to /add from the report page Add Entry link', { tag: ['@medium', '@feature02'] }, async ({ page }) => {
  await page.goto('/report');
  await page.getByTestId('nav-add-entry').click();
  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByTestId('page-title')).toHaveText('Add Timesheet Entry');
});

test('TC003: submit a valid entry saves and redirects to /report', { tag: ['@high', '@feature02'] }, async ({ page }) => {
  const date = '2026-07-15';
  await fillForm(page, { date, hours: '5.5', customer: CUSTOMER, project: PROJECT, description: 'Implemented add feature' });
  await page.getByTestId('submit-entry').click();

  // Redirected back to the report page.
  await expect(page).toHaveURL(/\/report$/);

  // The new entry appears when isolating its unique date.
  await page.goto(`/report?from=${date}&to=${date}`);
  const row = page.getByTestId('report-row').filter({ hasText: PROJECT });
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId('cell-employee')).toHaveText(CUSTOMER);
  await expect(row.getByTestId('cell-date')).toHaveText(date);
  await expect(row.getByTestId('cell-hours')).toHaveText('5.5');
});

test('TC004: missing Date shows a validation error and does not redirect', { tag: ['@high', '@feature02'] }, async ({ page }) => {
  await fillForm(page, { hours: '3', customer: CUSTOMER, project: PROJECT });
  await page.getByTestId('submit-entry').click();

  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByTestId('error-date')).toHaveText('Date is required');
});

test('TC005: missing Hours shows a validation error', { tag: ['@high', '@feature02'] }, async ({ page }) => {
  await fillForm(page, { date: '2026-07-16', customer: CUSTOMER, project: PROJECT });
  await page.getByTestId('submit-entry').click();

  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByTestId('error-hours')).toHaveText('Hours spent must be a positive number');
});

test('TC006: non-positive Hours shows a validation error', { tag: ['@high', '@feature02'] }, async ({ page }) => {
  await fillForm(page, { date: '2026-07-16', hours: '0', customer: CUSTOMER, project: PROJECT });
  await page.getByTestId('submit-entry').click();

  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByTestId('error-hours')).toHaveText('Hours spent must be a positive number');
});

test('TC007: missing Customer shows a validation error', { tag: ['@high', '@feature02'] }, async ({ page }) => {
  await fillForm(page, { date: '2026-07-16', hours: '3', project: PROJECT });
  await page.getByTestId('submit-entry').click();

  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByTestId('error-customer')).toHaveText('Customer is required');
});

test('TC008: missing Project shows a validation error', { tag: ['@high', '@feature02'] }, async ({ page }) => {
  await fillForm(page, { date: '2026-07-16', hours: '3', customer: CUSTOMER });
  await page.getByTestId('submit-entry').click();

  await expect(page).toHaveURL(/\/add$/);
  await expect(page.getByTestId('error-project')).toHaveText('Project is required');
});

test('TC009: Task Description is optional — entry saves without it', { tag: ['@medium', '@feature02'] }, async ({ page }) => {
  const date = '2026-07-20';
  await fillForm(page, { date, hours: '2', customer: CUSTOMER, project: PROJECT });
  await page.getByTestId('submit-entry').click();

  await expect(page).toHaveURL(/\/report$/);

  await page.goto(`/report?from=${date}&to=${date}`);
  const row = page.getByTestId('report-row').filter({ hasText: PROJECT });
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId('cell-hours')).toHaveText('2.0');
});

test('TC010: invalid submit preserves entered values', { tag: ['@medium', '@feature02'] }, async ({ page }) => {
  // Missing date, but other fields filled — they should be repopulated.
  await fillForm(page, { hours: '4', customer: CUSTOMER, project: PROJECT, description: 'Keep me' });
  await page.getByTestId('submit-entry').click();

  await expect(page.getByTestId('error-date')).toBeVisible();
  await expect(page.getByTestId('input-hours')).toHaveValue('4');
  await expect(page.getByTestId('input-customer')).toHaveValue(CUSTOMER);
  await expect(page.getByTestId('input-project')).toHaveValue(PROJECT);
  await expect(page.getByTestId('input-description')).toHaveValue('Keep me');
});
