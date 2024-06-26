const express = require('express');
const { createPreferences } = require('../controllers/preferencesController');

const router = express.Router();

router.post('/create', createPreferences);

module.exports = router;
