const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

/// @desc        Get all courses
/// @route       GET /api/v1/courses
/// @route       GET /api/v1/bootcamps/:bootcampId/courses
/// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;
	if (req.params.bootcampId) {
		// Get Courses in a Specific Bootcamp
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		// Get all courses
		query = Course.find();
	}

	// Excute query
	const courses = await query;
	res.status(200).json({
		success: true,
		count: courses.length,
		data: courses
	});
});

/// @desc        Get single course
/// @route       GET /api/v1/courses
/// @route       GET /api/v1/bootcamps/courses/:id
/// @access      Public
exports.getCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id).populate({
		path: 'bootcamp',
		select: 'name description'
	});
	if (!course) {
		return next(new AppError(`There is no doc for this id : ${req.params.id}`, 404));
	}
	res.status(200).json({ success: true, data: course });
});

/// Middleware to Set Bootcamp ID to body before creating course
exports.setBootcampId = (req, res, next) => {
	if (!req.body.bootcamp) req.body.bootcamp = req.params.bootcampId;
	next();
};

/// @desc        Add course for a specific bootcamp
/// @route       Post /api/v1/bootcamps/bootcampId/courses
/// @access      Private
exports.createCourse = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.bootcampId);

	if (!bootcamp) {
		return next(new AppError(`There is no bootcamp for this id:${req.params.bootcampId}`, 404));
	}

	const course = await Course.create(req.body);

	res.status(200).json({ success: true, data: course });
});

// @desc        update course
// @route       PUT /api/v1/courses/:id
// @access      Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});
	if (!course) {
		return next(new AppError(`There is no course for this id:${req.params.id}`, 404));
	}
	res.status(200).json({ success: true, data: course });
});

// @desc        delete course
// @route       DELETE /api/v1/courses/:id
// @access      Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
	const course = await Course.findById(req.params.id);
	if (!course) {
		return next(new AppError(`There is no course for this id:${req.params.id}`, 404));
	}
	await course.remove();
	res.status(204).json({ success: true, data: [] });
});
