const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
	title: {
		type: String,
		trim: true,
		required: [ true, 'Please add course title' ]
	},
	description: {
		type: String,
		required: [ true, 'Please add a description' ]
	},
	weeks: {
		type: String,
		required: [ true, 'Please add number of weeks' ]
	},
	tuition: {
		type: Number,
		required: [ true, 'Please add a tuition cost' ]
	},
	minimumSkill: {
		type: String,
		required: [ true, 'PPlease add a minimum skill' ],
		enum: [ 'beginner', 'intermediate', 'advanced' ]
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false
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

/// Static method to get average of bootcamp courses cost
courseSchema.statics.getAverageCost = async function(bootcampId) {
	const statics = await this.aggregate([
		// Stage 1: condtion => get courses in specific bootcamp
		{ $match: { bootcamp: bootcampId } },
		// Stage 2: calculate statics
		{
			$group: {
				_id: '$bootcamp',
				averageCost: { $avg: '$tuition' }
			}
		}
	]);
	try {
		if (statics.length >= 1) {
			await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
				averageCost: Math.ceil(statics[0].averageCost / 10) * 10
			});
		} else {
			await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
				averageCost: 0
			});
		}
	} catch (error) {
		console.log(error);
	}
};

/// Call getAveragecost after save course
courseSchema.post('save', async function() {
	await this.constructor.getAverageCost(this.bootcamp);
});

/// Call getAveragecost before remove course
courseSchema.pre('remove', async function() {
	await this.constructor.getAverageCost(this.bootcamp);
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;

// note: populate will add new query that mean request will do two queries one for find courses and second for populate courses
// courseSchema.pre(/^find/, function(next) {
// 	this.populate({
// 		path: 'bootcamp',
// 		select: 'name description'
// 	});
// 	next();
// });

// The Diff between courseSchema.statics & courseSchema.methods :
// Statics on the model, we call it by model it self => Course.goFish(); or this.goFish();
// methods on query, we call it by the query => const courses = Course.find(); => course.goFish();
