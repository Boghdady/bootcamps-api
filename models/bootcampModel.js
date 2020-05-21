/* eslint-disable no-useless-escape */
const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');
const Course = require('./courseModel');
const Review = require('./reviewModel');

const bootcampSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [ true, 'Please add a name' ],
			unique: true,
			trim: true,
			maxlength: [ 50, 'Name can not be more than 50 characters' ]
		},
		slug: String,
		description: {
			type: String,
			required: [ true, 'Please add a description' ],
			maxlength: [ 500, 'Description can not be more than 500 characters' ]
		},
		website: {
			type: String,
			match: [
				// eslint-disable-next-line no-useless-escape
				/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
				'Please use a valid URL with HTTP or HTTPS'
			]
		},
		phone: {
			type: String,
			maxlength: [ 20, 'Phone number can not be longer than 20 characters' ]
		},
		email: {
			type: String,
			match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ]
		},
		address: {
			type: String,
			required: [ true, 'Please add an address' ]
		},
		location: {
			// GeoJSON Point
			type: {
				type: String,
				enum: [ 'Point' ]
				// required: true
			},
			coordinates: {
				type: [ Number ],
				// required: true,
				index: '2dsphere'
			},
			formattedAddress: String,
			street: String,
			city: String,
			state: String,
			zipcode: String,
			country: String
		},
		careers: {
			// Array of strings
			type: [ String ],
			required: true,
			enum: [ 'Web Development', 'Mobile Development', 'UI/UX', 'Data Science', 'Business', 'Other' ]
		},
		averageCost: Number,
		photo: {
			type: String,
			default: 'no-photo.jpg'
		},
		housing: {
			type: Boolean,
			default: false
		},
		jobAssistance: {
			type: Boolean,
			default: false
		},
		jobGuarantee: {
			type: Boolean,
			default: false
		},
		acceptGi: {
			type: Boolean,
			default: false
		},

		createdAt: {
			type: Date,
			default: Date.now
		},
		averageRating: {
			type: Number,
			min: [ 1, 'Average rating must be at least 1' ],
			max: [ 10, 'Average rating must can not be more than 10' ],
			set: (val) => Math.round(val * 10) / 10
		},
		ratingsQuantity: {
			type: Number,
			default: 0
		},
		user: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

// Create bootcamp slug from the name
bootcampSchema.pre('save', function(next) {
	this.slug = slugify(this.name, { lower: true });
	next();
});

// Geocode and create location field
bootcampSchema.pre('save', async function(next) {
	const loc = await geocoder.geocode(this.address);
	this.location = {
		type: 'Point',
		coordinates: [ loc[0].longitude, loc[0].latitude ],
		formattedAddress: loc[0].formattedAddress,
		street: loc[0].streetName,
		city: loc[0].city,
		state: loc[0].stateCode,
		zipcode: loc[0].zipcode,
		country: loc[0].countryCode
	};
	// Do not save address in DB
	this.address = undefined;
	next();
});

// Virtual properties did not save in the database, it only show in the response.
// Show courses for this bootcamp
// note :  we will make populate in this path 'courses'
// Reverse populate with virtual
bootcampSchema.virtual('courses', {
	ref: 'Course',
	localField: '_id',
	foreignField: 'bootcamp',
	justOne: false
});

// Delete courses for bootcamp when delete this bootcamp (Cascade)
bootcampSchema.pre('remove', async function(next) {
	console.log(`courses for bootcampId : ${this._id} are deleted`);
	await this.model('Course').deleteMany({ bootcamp: this._id });
	await this.model('Review').deleteMany({ bootcamp: this._id });
	next();
});

module.exports = mongoose.model('Bootcamp', bootcampSchema);
