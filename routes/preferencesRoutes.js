const express = require('express');
const { createPreferences, updatePreferences, getAllPreferences,calculateVacationResults } = require('../controllers/preferencesController');

const router = express.Router();

router.post('/create', createPreferences);
router.put('/update', updatePreferences);
router.get('/all', getAllPreferences);
router.get('/calculate', calculateVacationResults); 

module.exports = router;
