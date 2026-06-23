'use strict';

const express = require('express');
const router = express.Router();
const { reset } = require('../models/db');

// Test-support endpoint: restores the deterministic seed dataset so that
// tests run against a clean, isolated database. Never mounted in production.
router.post('/__test/reset', (req, res) => {
  reset();
  res.status(204).end();
});

module.exports = router;
