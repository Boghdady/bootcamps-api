const express = require('express');
const courseRouter = require('./courseRoutes');
const {
	getBootcamps,
	createBootcamp,
	getBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsWithInRadius,
	getBootcampsWithInDistance
} = require('../controllers/bootcampController');

const router = express.Router();

/// Re-route into other resources routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsWithInRadius);
router.route('/bootcamps-within/:distance/center/:latlng/unit/:unit').get(getBootcampsWithInDistance);

router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

module.exports = router;
