const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');

const createTokenAndSendViaCookie = (user, statusCode, res) => {
	const token = user.createSignedJwtToken();
	const cokieOptions = {
		expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE_IN * 24 * 60 * 60 * 1000),
		httpOnly: true
	};
	if (process.env.NODE_ENV === 'production') cokieOptions.secure = true;

	res.status(statusCode).cookie('token', token, cokieOptions).json({ success: true, token });
};

/// @desc        Regitser user
/// @route       POST /api/v1/auth/register
/// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
	const { name, email, password, passwordConfirm, role } = req.body;
	const user = await User.create({ name, email, password, passwordConfirm, role });

	// Craete token
	createTokenAndSendViaCookie(user, 201, res);
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
	console.log(isMatch);
	if (!isMatch) {
		return next(new AppError('Invalid email or password', 401));
	}

	// Craete token
	createTokenAndSendViaCookie(user, 200, res);
});
