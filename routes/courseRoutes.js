const express = require('express');
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
	.post(setBootcampIdToBody, setBootcampIdToRequest, createCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
