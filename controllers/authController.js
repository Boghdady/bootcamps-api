const crypto = require('crypto');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

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
	if (!isMatch) {
		return next(new AppError('Invalid email or password', 401));
	}

	// Craete token
	createTokenAndSendViaCookie(user, 200, res);
});

/// @desc        Forgot password
/// @route       POST /api/v1/auth/forgotPassword
/// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
	const user = await User.findOne({ email: req.body.email });
	if (!user) return next(new AppError('There is no user for this email address', 404));

	// 1) Create reset token
	const resetToken = user.generateResetPasswordToken();
	// Save resetPasswordToken & resetPasswordExpire into database
	await user.save({ validateBeforeSave: false });

	// 2) Send resetToken via email
	const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

	const message = `Forgot your password? Submit a PATCH request with your new password and 
  passwordConfirm to : ${resetUrl}.\n If you didn't forgot your password, please ignore this email!`;

	try {
		await sendEmail({
			email: user.email,
			subject: 'Your password reset token (valid for 10 min)',
			message
		});

		res.status(200).json({
			status: 'Success',
			message: 'Token sent to your email!'
		});
	} catch (error) {
		console.log(error);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({ validateBeforeSave: false });
		return next(new AppError('There was an error sending the email. Try again later!', 500));
	}
});

/// @desc        Reset password
/// @route       PUT /api/v1/auth/resetPassword/:resetToken
/// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
	const { password, passwordConfirm } = req.body;
	const { resetToken } = req.params;

	// 1) Fetch user based on hashedToken
	const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
	if (!user) return next(new AppError('Token is invalid or has expired', 400));

	// 2) Update User Password
	user.password = password;
	user.passwordConfirm = passwordConfirm;
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;
	await user.save({ validateBeforeSave: true });

	createTokenAndSendViaCookie(user, 200, res);
});

/// @desc        Get current logged user
/// @route       GET /api/v1/users/me
/// @access      private
exports.getMe = asyncHandler(async (req, res, next) => {
	res.status(200).json({
		success: true,
		data: req.user
	});
});

// Take an object and array of allowedFields to return object with properties that i need to update
const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

/// @desc        Update logged in user
/// @route       PUT /api/v1/auth/updateMe
/// @access      private
exports.updateMe = asyncHandler(async (req, res, next) => {
	if (req.body.password || req.body.passwordConfirm)
		return next(
			new AppError('This route is not for update password. You should user /auth/updatePassword route', 400)
		);

	const fieldsToUpdate = filterObj(req.body, 'name', 'email');
	const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
		new: true,
		runValidators: true
	});

	res.status(200).json({ success: true, data: user });
});
