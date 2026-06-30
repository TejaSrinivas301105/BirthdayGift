const express = require('express');
const router = express.Router();
const { submitFeedback, getFeedbackStats } = require('../controllers/feedbackController');

router.post('/', submitFeedback);
router.get('/stats', getFeedbackStats);

module.exports = router;
