const express = require('express');
const {
	getCourses,
	getCourse,
	createCourse,
	updateCourse,
	deleteCourse,
	setBootcampId
} = require('../controllers/courseController');

// mergeParams : allow us to access the parameters on other routers
// ex: we access bootcampId from bootcamp router
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses).post(setBootcampId, createCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
