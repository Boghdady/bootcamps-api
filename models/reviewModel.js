const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const reviewSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [ true, 'Please add a title for the review' ],
		maxlength: 100
	},
	text: {
		type: String,
		required: [ true, 'Please add some text' ]
	},
	rating: {
		type: Number,
		min: 1,
		max: 10,
		required: [ true, 'Please add a rating between 1 and 10' ]
	},

	createdAt: {
		type: Date,
		default: Date.now
	},
	bootcamp: {
		type: mongoose.Schema.ObjectId,
		ref: 'Bootcamp',
		required: true
	},
	user: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true
	}
});

/// Prevent user from submitting more than one review per bootcamp
reviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true });
reviewSchema.plugin(uniqueValidator, {
	message: 'Can not write another review in the same bootcamp'
});

/// Calculate average bootcamp rating & quantity
reviewSchema.statics.calcAverageRatingsAndQuantity = async function(bootcampId) {
	const statics = await this.aggregate([
		{
			$match: { bootcamp: bootcampId }
		},
		{
			$group: {
				_id: '$bootcamp',
				avgRating: { $avg: '$rating' },
				nRating: { $sum: 1 }
			}
		}
	]);

	if (statics.length >= 1) {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageRating: statics[0].avgRating,
			ratingsQuantity: statics[0].nRating
		});
	} else {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageRating: 0,
			ratingsQuantity: 0
		});
	}
};

reviewSchema.post('save', async function() {
	await this.constructor.calcAverageRatingsAndQuantity(this.bootcamp);
});
reviewSchema.post('remove', async function() {
	await this.constructor.calcAverageRatingsAndQuantity(this.bootcamp);
});

// reviewSchema.pre(/^findOneAnd/, async function() {
// 	this.r = await this.findOne();
// });
// reviewSchema.post(/^findOneAnd/, async function() {
// 	if (this.r) await this.r.constructor.calcAverageRatingsAndQuantity(this.r.bootcamp);
// });

module.exports = mongoose.model('Review', reviewSchema);

// statics methods : we can only call it on the model
// ex: (Review.calcAverageRatingsAndQuantity() or
// this.calcAverageRatingsAndQuantity())
