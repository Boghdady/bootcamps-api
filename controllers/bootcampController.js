/* eslint-disable node/no-unsupported-features/es-syntax */
const Bootcamp = require('../models/bootcampModel');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');

// @desc        Get all bootcamps
// @route       GET /api/v1/bootcamps
// @access      Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
	let query;
	const queryObj = { ...req.query };
	const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];
	excludedFields.forEach((el) => delete queryObj[el]);
	let queryStr = JSON.stringify(queryObj);
	// replace any (gte,gt,lte,lt) with ($gte,$gt,$lte,$lt)
	queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

	/// Finding resource (Filter)
	query = Bootcamp.find(JSON.parse(queryStr));

	///  Select Fields
	if (req.query.fields) {
		const fields = req.query.fields.split(',').join(' ');
		query = query.select(fields);
	}

	/// Sort
	if (req.query.sort) {
		const sortBy = req.query.sort.split(',').join(' ');
		query = query.sort(sortBy);
	} else {
		query = query.sort('-createdAt');
	}

	/// Pagination
	const page = req.query.page * 1 || 1;
	const limit = req.query.limit * 1 || 25;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	const total = await Bootcamp.countDocuments();

	query = query.skip(startIndex).limit(limit);

	///  Excute query
	const bootcamps = await query;

	/// Pagination Result (next - prev)
	const pagination = {};
	if (endIndex < total) {
		pagination.next = {
			page: page + 1,
			limit: limit
		};
	}
	if (startIndex > 0) {
		pagination.prev = {
			page: page - 1,
			limit: limit
		};
	}

	res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
});

// @desc        Get single bootcamps
// @route       GET /api/v1/bootcamps/:id
// @access      Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(req.params.id);
	if (!bootcamp) {
		return next(new AppError(`There are no bootcamp for this id : ${req.params.id}`, 404));
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Create new bootcamp
// @route       POST /api/v1/bootcamps
// @access      private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({ success: true, data: bootcamp });
});

// @desc        Upadate a bootcamp
// @route       PUT /api/v1/bootcamps/:id
// @access      private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true
	});
	if (!bootcamp) {
		return res.status(404).json({ success: false, data: null });
	}
	res.status(200).json({ success: true, data: bootcamp });
});

// @desc        Delete a bootcamp
// @route       DELETE /api/v1/bootcamps/:id
// @access      private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
	res.status(200).json({ success: true, data: bootcamp });
});

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
