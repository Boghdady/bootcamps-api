const express = require('express');
const { protect } = require('../middleware/auth');
const {
	getReviews,
	getReview,
	createReview,
	updateReview,
	deleteReview,
	createFilterObjectForNestedRoute,
	setUserAndBootcampIdToBody,
	checkIfUserWriteReviewBefore,
	checkReviewOwnership
} = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(createFilterObjectForNestedRoute, getReviews)
	.post(protect, setUserAndBootcampIdToBody, checkIfUserWriteReviewBefore, createReview);
router
	.route('/:id')
	.get(getReview)
	.put(protect, checkReviewOwnership, updateReview)
	.delete(protect, checkReviewOwnership, deleteReview);

module.exports = router;
