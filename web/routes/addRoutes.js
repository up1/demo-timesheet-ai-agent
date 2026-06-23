'use strict';

const express = require('express');
const router = express.Router();
const addController = require('../controllers/addController');

router.get('/add', addController.getAddForm);
router.post('/add', addController.postAddEntry);

module.exports = router;
