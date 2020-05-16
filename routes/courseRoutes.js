const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	setUserAndBootcampIdToBody,
	createFilterObjectForNestedRoute,
	onlyBootcampOwnerCanAddCourseForBootcamp,
	checkCourseOwnership
} = require('../controllers/courseController');

// mergeParams : allow us to access the parameters on other routers
// ex: we access bootcampId from bootcamp router
const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(createFilterObjectForNestedRoute, getCourses)
	.post(
		protect,
		authorize('publisher', 'admin'),
		setUserAndBootcampIdToBody,
		onlyBootcampOwnerCanAddCourseForBootcamp,
		createCourse
	);
router
	.route('/:id')
	.get(getCourse)
	.put(protect, authorize('publisher', 'admin'), checkCourseOwnership, updateCourse)
	.delete(protect, authorize('publisher', 'admin'), checkCourseOwnership, deleteCourse);

module.exports = router;
