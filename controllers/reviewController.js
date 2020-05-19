const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

/// Middleware to create filterObject for get reviews In bootcamp
exports.createFilterObjectForNestedRoute = (req, res, next) => {
	let filter = {};
	if (req.params.bootcampId) filter = { bootcamp: req.params.bootcampId };
	req.filterObject = filter;
	next();
};

/// @desc        Get all reviews
/// @route       GET /api/v1/reviews
/// @route       GET /api/v1/bootcamps/:bootcampId/reviews
/// @access      Public
exports.getReviews = factory.getAll(Review, {
	path: 'bootcamp',
	select: 'name description'
});

/// @desc        Get a single review
/// @route       GET /api/v1/reviews/:id
/// @access      Public
exports.getReview = factory.getOne(Review, {
	path: 'bootcamp',
	select: 'name description'
});

// Middleware to Set User and Bootcamp ID to body before creating review (create review for bootcamp)
exports.setUserAndBootcampIdToBody = (req, res, next) => {
	if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};

// User can add only one review
exports.checkIfUserWriteReviewBefore = asyncHandler(async (req, res, next) => {
	const review = await Review.findOne({ user: req.user.id });
	if (review) return next(new AppError('You Write a Review Before', 400));
	next();
});

/// @desc        Create review for specific bootcamp
/// @route       GET /api/v1/reviews
/// @access      Private
exports.createReview = factory.createOne(Review);

// Check user is review ownerhsip before update and delete
exports.checkReviewOwnership = asyncHandler(async (req, res, next) => {
	const review = await Review.findById(req.params.id);
	if (!review) return next(new AppError(`No document found with that ID : ${req.params.id}`, 404));

	if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new AppError('You are not the owner to perform this action', 401));
	}
	next();
});

/// @desc        Update review
/// @route       PUT /api/v1/reviews/:id
/// @access      Private
exports.updateReview = factory.updateOne(Review);

/// @desc        Delete review
/// @route       DELETE /api/v1/reviews/:id
/// @access      Private
exports.deleteReview = factory.deleteOne(Review);
