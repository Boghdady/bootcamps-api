const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');

/// @desc        Regitser user
/// @route       POST /api/v1/auth/register
/// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, passwordConfirm, role } = req.body;
	const user = await User.create({ name, email, password, passwordConfirm, role });

	// Craete token
	const token = await user.createSignedJwtToken();
	res.status(201).json({
		success: true,
		token
	});
});

/// @desc        Login user
/// @route       POST /api/v1/auth/login
/// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) return next(new AppError('Please provide an email and password', 400));

	// Find user
	const user = await User.findOne({ email }).select('+password');
	if (!user) return next(new AppError('Invalid email or password', 401));

	// Validate entered password
	const isMatch = await user.matchPassword(password);
	if (!isMatch) return next(new AppError('Invalid email or password', 401));

	// Craete token
	const token = await user.createSignedJwtToken();

	res.status(200).json({ success: true, token });
});
