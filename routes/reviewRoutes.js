const express = require('express');
const { getReviews } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getReviews);

module.exports = router;
