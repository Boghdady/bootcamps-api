const Course = require('../models/courseModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

// @desc        Get courses
// @route       GET /api/v1/courses
// @route       GET /api/v1/bootcamps/:bootcampId/courses
// @access      Public
exports.getCourses = asyncHandler(async (req, res, next) => {
	let query;
	if (req.params.bootcampId) {
		/// Get Courses in a Specific Bootcamp
		query = Course.find({ bootcamp: req.params.bootcampId });
	} else {
		/// Get all courses
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
exports.getCourse = asyncHandler(async (req, res, next) => {});
exports.createCourse = asyncHandler(async (req, res, next) => {});
exports.updateCourse = asyncHandler(async (req, res, next) => {});
exports.deleteCourse = asyncHandler(async (req, res, next) => {});
