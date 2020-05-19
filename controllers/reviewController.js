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
