'use strict';

const model = require('../models/timesheetModel');

/**
 * Validate the submitted add-entry form against the spec rules.
 * @param {Record<string, any>} body
 * @returns {{ errors: Record<string, string>, values: { date: string, hours: string, customer: string, project: string, description: string } }}
 */
function validate(body = {}) {
  const values = {
    date: String(body.date ?? '').trim(),
    hours: String(body.hours ?? '').trim(),
    customer: String(body.customer ?? '').trim(),
    project: String(body.project ?? '').trim(),
    description: String(body.description ?? '').trim(),
  };

  const errors = {};

  if (!values.date) {
    errors.date = 'Date is required';
  }

  const hoursNum = Number(values.hours);
  if (!values.hours || !Number.isFinite(hoursNum) || hoursNum <= 0) {
    errors.hours = 'Hours spent must be a positive number';
  }

  if (!values.customer) {
    errors.customer = 'Customer is required';
  }

  if (!values.project) {
    errors.project = 'Project is required';
  }

  // Task Description is optional; a form value is always a string, so this
  // rule can only fail for non-string payloads.
  if (body.description != null && typeof body.description !== 'string') {
    errors.description = 'Task description must be a string';
  }

  return { errors, values };
}

/** Render the empty add-entry form. */
exports.getAddForm = (req, res) => {
  res.render('add', {
    title: 'Add Timesheet Entry',
    active: 'add',
    errors: {},
    values: { date: '', hours: '', customer: '', project: '', description: '' },
    recent: model.getRecent(5),
    count: model.getCount(),
  });
};

/** Validate and persist a new entry, then redirect to the report page. */
exports.postAddEntry = (req, res) => {
  const { errors, values } = validate(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).render('add', {
      title: 'Add Timesheet Entry',
      active: 'add',
      errors,
      values,
      recent: model.getRecent(5),
      count: model.getCount(),
    });
  }

  // The schema has no Customer column; consistent with the report feature,
  // the Customer value is stored in the `employee_name` column.
  model.createEntry({
    employee_name: values.customer,
    date: values.date,
    project: values.project,
    description: values.description,
    hours: Number(values.hours),
  });

  res.redirect('/report');
};
