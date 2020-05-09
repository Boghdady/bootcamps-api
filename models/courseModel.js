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
	}
});

// note: populate will add new query that mean request will do two queries one for find courses and second for populate courses
// courseSchema.pre(/^find/, function(next) {
// 	this.populate({
// 		path: 'bootcamp',
// 		select: 'name description'
// 	});
// 	next();
// });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
