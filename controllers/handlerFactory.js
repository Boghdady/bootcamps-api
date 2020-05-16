const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const ApiFeatures = require('../utils/ApiFeatures');

// These function return function (Closure concept in js)
exports.deleteOne = (Model) =>
	asyncHandler(async (req, res, next) => {
		const doc = await Model.findById(req.params.id);
		if (!doc) {
			return next(new AppError(`No document found with that ID: ${req.params.id}`, 404));
		}
		/// Use 'remove' method trigger 'remove' event in pre middleware
		await doc.remove();
		//success, 204 mean no content
		return res.status(204).json({
			status: true,
			data: null
		});
	});

exports.updateOne = (Model) =>
	asyncHandler(async (req, res, next) => {
		const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true
		});
		if (!doc) {
			return next(new AppError(`No document found with that ID : ${req.params.id}`, 404));
		}
		res.status(200).json({
			success: true,
			data: doc
		});
	});

exports.createOne = (Model) =>
	asyncHandler(async (req, res, next) => {
		// create : if there are data in the body not exist in the Schema will ignore it
		const newDoc = await Model.create(req.body);
		res.status(201).json({
			success: true,
			data: newDoc
		});
	});

exports.getOne = (Model, populateOptions) =>
	asyncHandler(async (req, res, next) => {
		let query = Model.findById(req.params.id);
		if (populateOptions) query = query.populate(populateOptions);
		const doc = await query;

		if (!doc) {
			return next(new AppError(`No document found with that ID : ${req.params.id}`, 404));
		}
		res.status(200).json({
			success: true,
			data: doc
		});
	});

exports.getAll = (Model, populateOptions) =>
	asyncHandler(async (req, res, next) => {
		// To allow nested routes like get all courses on a Bootcamp
		const filter = req.filterObject || {};
		let query = Model.find(filter);
		if (populateOptions) query = query.populate(populateOptions);

		const countDocuments = await Model.countDocuments();

		//************** 1) BUILD THE QUERY *****************//
		const apiFeatures = new ApiFeatures(query, req.query).filter().sort().limitFields().paginate(countDocuments);
		const { paginationResult, mongooseQuery } = apiFeatures;

		//************** 2) EXECUTE THE QUERY *****************//
		// const allDocs = await apiFeatures.mongooseQuery.explain();

		const allDocs = await mongooseQuery;

		//************** 3) SEND RESPONSE *****************//
		res.status(200).json({
			success: true,
			count: allDocs.length,
			paginationResult,
			data: allDocs
		});
	});
