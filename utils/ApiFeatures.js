/* eslint-disable node/no-unsupported-features/es-syntax */
class ApiFeatures {
	constructor(mongooseQuery, queryString) {
		this.mongooseQuery = mongooseQuery;
		this.queryString = queryString;
	}

	/// @desc   Advanced Filtering using ($gte,$gt,$lte,$lt,$in)
	filter() {
		const queryObj = { ...this.queryString };
		const excludedFields = [ 'page', 'sort', 'limit', 'fields' ];
		excludedFields.forEach((el) => queryObj[el]);

		let queryStr = JSON.stringify(queryObj);
		// replace any (gte,gt,lte,lt) with ($gte,$gt,$lte,$lt)
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt|in)\b/g, (match) => `$${match}`);

		this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));
		return this;
	}

	/// @desc   Sorting (ask + , desk -)
	sort() {
		if (this.queryString.sort) {
			const sortBy = this.queryString.sort.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.sort(sortBy);
		} else {
			this.mongooseQuery = this.mongooseQuery.sort('-createdAt');
		}
		return this;
	}

	/// @desc   Field Limiting : Choose which fields will be in response
	limitField() {
		if (this.queryString.select) {
			const fields = this.queryString.select.split(',').join(' ');
			this.mongooseQuery = this.mongooseQuery.select(fields);
		} else {
			this.mongooseQuery = this.mongooseQuery.select('-__v');
		}
		return this;
	}

	/// @desc   Pagination
	/// @example     page=2&limit=10 ==> 1-10 = page 1 , 11-20 = page 2 , 21-30 page 30
	paginate() {
		const page = this.queryString.page * 1 || 1;
		const limit = this.queryString.limit * 1 || 25;
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
		// const total = await this.mongooseQuery.countDocuments();

		this.mongooseQuery = this.mongooseQuery.skip(startIndex).limit(limit);

		// Pagination Result
		// const pagination = {};
		// if (endIndex < total) {
		// 	pagination.next = {
		// 		page: page + 1,
		// 		limit: limit
		// 	};
		// }
		// if (startIndex > 0) {
		// 	pagination.prev = {
		// 		page: page - 1,
		// 		limit: limit
		// 	};
		// }

		return this;
	}
}

module.exports = ApiFeatures;
