const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
	getReviews,
	getReview,
	createReview,
	updateReview,
	deleteReview,
	createFilterObjectForNestedRoute,
	setUserAndBootcampIdToBody,
	checkReviewOwnership
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(createFilterObjectForNestedRoute, getReviews)
	.post(protect, authorize('user', 'admin'), setUserAndBootcampIdToBody, createReview);
router
	.route('/:id')
	.get(getReview)
	.put(protect, checkReviewOwnership, updateReview)
	.delete(protect, checkReviewOwnership, deleteReview);

module.exports = router;
