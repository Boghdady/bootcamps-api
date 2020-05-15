const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	setBootcampIdToBody,
	createFilterObjectForNestedRoute,
	setBootcampIdToRequest
} = require('../controllers/courseController');

// mergeParams : allow us to access the parameters on other routers
// ex: we access bootcampId from bootcamp router
const router = express.Router({ mergeParams: true });

router
	.route('/')
	.get(createFilterObjectForNestedRoute, getCourses)
	.post(protect, authorize('publisher', 'admin'), setBootcampIdToBody, setBootcampIdToRequest, createCourse);
router
	.route('/:id')
	.get(getCourse)
	.put(protect, authorize('publisher', 'admin'), updateCourse)
	.delete(protect, authorize('publisher', 'admin'), deleteCourse);

module.exports = router;
