const express = require('express');
const courseRouter = require('./courseRoutes');
const { protect, authorize } = require('../middleware/auth');
const {
	getBootcamps,
	createBootcamp,
	getBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsWithInRadius,
	getBootcampsWithInDistance,
	uploadBootcampImage,
	resizeBootcampImage,
	setUserIdToBody,
	onlyAdminAddMoreThanOneBootcamp,
	checkBootcampOwnership
} = require('../controllers/bootcampController');

const router = express.Router();

/// Re-route into other resources routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsWithInRadius);
router.route('/bootcamps-within/:distance/center/:latlng/unit/:unit').get(getBootcampsWithInDistance);

router
	.route('/')
	.get(getBootcamps)
	.post(protect, authorize('publisher', 'admin'), setUserIdToBody, onlyAdminAddMoreThanOneBootcamp, createBootcamp);
router
	.route('/:id')
	.get(getBootcamp)
	.put(
		protect,
		authorize('publisher', 'admin'),
		checkBootcampOwnership,
		uploadBootcampImage,
		resizeBootcampImage,
		updateBootcamp
	)
	.delete(protect, authorize('publisher', 'admin'), checkBootcampOwnership, deleteBootcamp);

module.exports = router;
