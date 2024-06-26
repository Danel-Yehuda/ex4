const express = require('express');
const { createPreferences, updatePreferences } = require('../controllers/preferencesController');

const router = express.Router();

router.post('/create', createPreferences);
router.put('/update', updatePreferences);

module.exports = router;
