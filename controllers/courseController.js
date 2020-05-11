/* eslint-disable prefer-destructuring */
const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const factory = require('./handlerFactory');

// Middleware to create filterObject for get courses for bootcamp model
exports.createFilterObjectForNestedRoute = (req, res, next) => {
	let filter = {};
	if (req.params.bootcampId) filter = { bootcamp: req.params.bootcampId };
	req.filterObject = filter;
	next();
};

/// @desc        Get all courses
/// @route       GET /api/v1/courses
/// @route       GET /api/v1/bootcamps/:bootcampId/courses
/// @access      Public
exports.getCourses = factory.getAll(Course, {
	path: 'bootcamp',
	select: 'name description'
});

/// @desc        Get single course
/// @route       GET /api/v1/courses
/// @route       GET /api/v1/bootcamps/courses/:id
/// @access      Public
exports.getCourse = factory.getOne(Course, {
	path: 'bootcamp',
	select: 'name description'
});

// Middleware to Set Bootcamp ID to body before creating course
exports.setBootcampIdToBody = (req, res, next) => {
	if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;
	next();
};
// Middleware to Set bootcampId to req to create course for bootcamp
exports.setBootcampIdToRequest = (req, res, next) => {
	let bootcampId;
	if (req.params.bootcampId) bootcampId = req.params.bootcampId;
	req.parentId = bootcampId;
	next();
};

/// @desc        Add course for a specific bootcamp
/// @route       Post /api/v1/bootcamps/bootcampId/courses
/// @access      Private
exports.createCourse = factory.createOne(Course, Bootcamp);

/// @desc        update course
/// @route       PUT /api/v1/courses/:id
/// @access      Private
exports.updateCourse = factory.updateOne(Course);

/// @desc        delete course
/// @route       DELETE /api/v1/courses/:id
/// @access      Private
exports.deleteCourse = factory.deleteOne(Course);
