/* eslint-disable node/no-unsupported-features/es-syntax */
const Bootcamp = require('../models/bootcampModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');
const factory = require('./handlerFactory');

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = factory.getAll(Bootcamp);

// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = factory.getOne(Bootcamp, { path: 'courses' });

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      private
exports.createBootcamp = factory.createOne(Bootcamp);

// @desc        Upadate a bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      private
exports.updateBootcamp = factory.updateOne(Bootcamp);

// @desc        Delete a bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      private
exports.deleteBootcamp = factory.deleteOne(Bootcamp);

// @desc        Get bootcamps with a radius of specific zipcode and distance
// @route       GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access      private
exports.getBootcampsWithInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = req.params;

	// Get lat , lng from geocoder
	const loc = await geocoder.geocode(zipcode);
	const lat = loc[0].latitude;
	const lng = loc[0].longitude;

	// convert distance to radiance to be understandable for mongodb geospatial query
	// Calc Radius using Radians by Dividing distance / radius of the earth
	// Earth radius = 3963.2 mi = 6378.1 km
	const radius = distance / 3963.2;

	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
	});

	res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});

// @desc        Get bootcamps within distance, latlng and unit
// @route       GET /api/v1/bootcamps/bootcamps-within/:distance/center/:latlng/unit/:unit
// @access      private

exports.getBootcampsWithInDistance = asyncHandler(async (req, res, next) => {
	const { distance, latlng, unit } = req.params;
	const [ lat, lng ] = latlng.split(',');

	// convert distance to radiance to be understandable for mongodb geospatial query
	// Calc Radius using Radians by Dividing distance / radius of the earth
	// Earth radius = 3.963 mi = 6378.1 km
	const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

	if (!lat || !lng) {
		return next(new AppError('Please provide latitude and longitude in the format lat,lng', 400));
	}

	// Get all bootcamps that their start location point within the required point
	const bootcamps = await Bootcamp.find({
		location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
	});

	res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});
