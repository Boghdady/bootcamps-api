/* eslint-disable prefer-destructuring */
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const asyncHandler = require('./asyncHandler');
const User = require('../models/userModel');

/// There are two types of errors may happen here :
/// 1- token changed    2- token expired
/// We handled them in global error handler
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  // Get token from authorization header or cookie
  if (authorization && authorization.startsWith('Bearer')) {
    token = authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new AppError('Your are not register, please register to get access', 401));
  }

  // util.promisify convert traditional callback methods into promise
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  // That's mean token is valid but user is deleted
  if (!currentUser) return next(new AppError('The user belonging to this token does not exist', 401));

  // Check if the user change password after token issued or stolen or hacked or any reasons
  // iat => is the timestamp for decoded token , should be bigger that the timestamp of passwordChangedAt field in database
  if (currentUser.checkIfUserChangePasswordAfter(decoded.iat))
    return next(new AppError('Your are recently changed password! Please login again'));

  req.user = currentUser;
  next();
});

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`this role : ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  };
};
