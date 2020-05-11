/* eslint-disable node/no-unsupported-features/es-syntax */
class ApiFeatures {
	constructor(mongooseQuery, queryString) {
		this.mongooseQuery = mongooseQuery;
		this.queryString = queryString;
	}

	/// @desc   Advanced Filtering using ($gte,$gt,$lte,$lt,$in)
	filter() {
		// create new object that copy all fields in query string
		const queryObj = { ...this.queryString };
		const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];
		// delete excluded fields from queryObj if exists
		excludedFields.forEach((el) => delete queryObj[el]);

		// ======> A) Advanced Filtering using gte,gt,lte,lt
		// Convert object to string
		let queryStr = JSON.stringify(queryObj);
		// replace any (gte,gt,lte,lt) with ($gte,$gt,$lte,$lt)
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

		// method 1) Filtering using query object (find return query)
		this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

		// to return the object, to can do chaining
		return this;
	}

	/// @desc   Sorting (ask + , desk -)
	sort() {
		if (this.queryString.sort) {
			console.log(this.queryString.sort);
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.sort(sortBy);
		} else {
			// default sort
			this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
		}
		// to return the object, to can do chaining
		return this;
	}

	/// @desc   Field Limiting : Choose which fields will be in response
	limitFields() {
		if (this.queryString.fields) {
			const fields = this.queryString.fields.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.select(fields);
		} else {
			this.mongooseQuery = this.mongooseQuery.select('-__v');
		}
		// to return the object, to can do chaining
		return this;
	}

	/// @desc   Pagination
	/// @example     page=2&limit=10 ==> 1-10 = page 1 , 11-20 = page 2 , 21-30 page 30
	paginate(countDocuments) {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 25;
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;

		this.mongooseQuery = this.mongooseQuery.skip(startIndex).limit(limit);
		// to return the object, to can do chaining

		// Pagination Result
		const pagination = {};
		if (endIndex < countDocuments) {
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

		this.paginationResult = pagination;
		return this;
	}
}

module.exports = ApiFeatures;
