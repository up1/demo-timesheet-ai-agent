'use strict';

const model = require('../models/timesheetModel');

const PAGE_SIZE = 10;

/** Build a query string from the active filters, optionally overriding the page. */
function buildQuery(filters, page) {
  const params = new URLSearchParams();
  if (filters.employee) params.set('employee', filters.employee);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (page) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

exports.getReport = (req, res) => {
  const filters = {
    employee: (req.query.employee || '').trim(),
    from: (req.query.from || '').trim(),
    to: (req.query.to || '').trim(),
  };

  let page = parseInt(req.query.page, 10);
  if (!Number.isInteger(page) || page < 1) page = 1;

  const count = model.getCount(filters);
  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  if (page > totalPages) page = totalPages;

  const rows = model.getRows(filters, page, PAGE_SIZE);
  const summary = model.getSummary(filters);

  const startIndex = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(page * PAGE_SIZE, count);

  res.render('report', {
    title: 'Timesheet Report',
    active: 'reports',
    rows,
    summary,
    filters,
    page,
    totalPages,
    count,
    startIndex,
    endIndex,
    pageSize: PAGE_SIZE,
    buildQuery,
  });
};
