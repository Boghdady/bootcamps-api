const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const handlerFactory = require('./handlerFactory');
const User = require('../models/userModel');

/// @desc        Get All users
/// @route       GET /api/v1/users
/// @access      Private/Admin
exports.getUsers = handlerFactory.getAll(User);

/// @desc        Get user
/// @route       GET /api/v1/users/:id
/// @access      Private/Admin
exports.getUser = handlerFactory.getOne(User);

/// @desc        Create user
/// @route       POST /api/v1/users
/// @access      Private/Admin
exports.createUser = handlerFactory.createOne(User);

/// @desc        Update user by admin
/// @route       PUT /api/v1/users/:id
/// @access      Private/Admin
exports.updateUser = handlerFactory.updateOne(User);

/// @desc        Delete user by admin
/// @route       Delete /api/v1/users/:id
/// @access      Private/Admin
exports.deleteUser = handlerFactory.deleteOne(User);
