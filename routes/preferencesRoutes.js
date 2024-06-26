const express = require('express');
const { createPreferences, updatePreferences, getAllPreferences } = require('../controllers/preferencesController');

const router = express.Router();

router.post('/create', createPreferences);
router.put('/update', updatePreferences);
router.get('/all', getAllPreferences);

module.exports = router;
