const express = require('express');
const { protect } = require('../middleware/auth');
const { getMe } = require('../controllers/userController');

const router = express.Router();

router.route('/me').get(protect, getMe);

module.exports = router;
