'use strict';

const { db } = require('./db');

/**
 * Build a parameterised WHERE clause from optional filters.
 * @param {{ employee?: string, from?: string, to?: string }} filter
 * @returns {{ where: string, params: Array<string> }}
 */
function buildWhere(filter = {}) {
  const clauses = [];
  const params = [];

  if (filter.employee) {
    clauses.push('employee_name LIKE ?');
    params.push(`%${filter.employee}%`);
  }
  if (filter.from) {
    clauses.push('date >= ?');
    params.push(filter.from);
  }
  if (filter.to) {
    clauses.push('date <= ?');
    params.push(filter.to);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return { where, params };
}

/** Count rows matching the filter. */
function getCount(filter = {}) {
  const { where, params } = buildWhere(filter);
  return db.prepare(`SELECT COUNT(*) AS c FROM timesheet_entries ${where}`).get(...params).c;
}

/** Get a page of rows matching the filter, ordered by date then id. */
function getRows(filter = {}, page = 1, pageSize = 10) {
  const { where, params } = buildWhere(filter);
  const offset = (page - 1) * pageSize;
  return db
    .prepare(`SELECT * FROM timesheet_entries ${where} ORDER BY date ASC, id ASC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);
}

/** Aggregate summary metrics over the filtered dataset. */
function getSummary(filter = {}) {
  const { where, params } = buildWhere(filter);
  const totalHours = db
    .prepare(`SELECT COALESCE(SUM(hours), 0) AS v FROM timesheet_entries ${where}`)
    .get(...params).v;
  const activeProjects = db
    .prepare(`SELECT COUNT(DISTINCT project) AS v FROM timesheet_entries ${where}`)
    .get(...params).v;
  const entries = db
    .prepare(`SELECT COUNT(*) AS v FROM timesheet_entries ${where}`)
    .get(...params).v;
  const developers = db
    .prepare(`SELECT COUNT(DISTINCT employee_name) AS v FROM timesheet_entries ${where}`)
    .get(...params).v;

  return {
    totalHours,
    activeProjects,
    // No billable flag in the schema: every tracked hour is treated as billable.
    billableHours: totalHours,
    avgEntriesPerDev: developers ? entries / developers : 0,
  };
}

/**
 * Insert a new timesheet entry.
 * @param {{ employee_name: string, date: string, project: string, description: string, hours: number }} entry
 * @returns {number|bigint} The id of the inserted row.
 */
function createEntry(entry) {
  const info = db
    .prepare(
      'INSERT INTO timesheet_entries (employee_name, date, project, description, hours) VALUES (?, ?, ?, ?, ?)'
    )
    .run(entry.employee_name, entry.date, entry.project, entry.description, entry.hours);
  return info.lastInsertRowid;
}

/** Get the most recently added entries (newest first). */
function getRecent(limit = 5) {
  return db.prepare('SELECT * FROM timesheet_entries ORDER BY id DESC LIMIT ?').all(limit);
}

module.exports = { getCount, getRows, getSummary, createEntry, getRecent };
