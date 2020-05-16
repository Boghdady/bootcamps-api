/* eslint-disable prefer-destructuring */
const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');
const factory = require('./handlerFactory');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

// Middleware to create filterObject for get courses In bootcamp
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
/// @access      Public
exports.getCourse = factory.getOne(Course, {
	path: 'bootcamp',
	select: 'name description'
});

// Middleware to Set User and Bootcamp ID to body before creating course (create course for bootcamp)
exports.setUserAndBootcampIdToBody = (req, res, next) => {
	if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;
	if (!req.body.user) req.body.user = req.user.id;
	next();
};

// Check if user is the bootcamp owner before creating course inside bootcamp
exports.onlyBootcampOwnerCanAddCourseForBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.bootcampId);
	if (!bootcamp) return next(new AppError(`There is no bootcamp for this id:${req.params.bootcampId}`, 404));
	if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new AppError('You are not the owner to perform this action', 401));
	}
	next();
});

/// @desc        Add course for a specific bootcamp
/// @route       Post /api/v1/bootcamps/bootcampId/courses
/// @access      Private
exports.createCourse = factory.createOne(Course);

// Check user is course ownerhsip before update and delete
exports.checkCourseOwnership = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);
	if (!course) return next(new AppError(`No document found with that ID : ${req.params.id}`, 404));

	if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
		return next(new AppError('You are not the owner to perform this action', 401));
	}
	next();
});
/// @desc        update course
/// @route       PUT /api/v1/courses/:id
/// @access      Private
exports.updateCourse = factory.updateOne(Course);

/// @desc        delete course
/// @route       DELETE /api/v1/courses/:id
/// @access      Private
exports.deleteCourse = factory.deleteOne(Course);
