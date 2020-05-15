const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');

/// @desc        Get current logged user
/// @route       GET /api/v1/users/me
/// @access      private

exports.getMe = asyncHandler(async (req, res, next) => {
	res.status(200).json({
		success: true,
		data: req.user
	});
});
