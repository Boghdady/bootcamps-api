const express = require('express');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

// mergeParams : allow us to access the parameters on other routers
// ex: we access bootcampId from bootcamp router
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses);

module.exports = router;
