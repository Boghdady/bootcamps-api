/* eslint-disable no-useless-escape */
const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [ true, 'Please add a name' ]
	},
	email: {
		type: String,
		required: [ true, 'Please add an email' ],
		unique: true,
		match: [ /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email' ]
	},
	role: {
		type: String,
		enum: [ 'user', 'publisher' ],
		default: 'user'
	},
	password: {
		type: String,
		required: [ true, 'Please add a password' ],
		minlength: 6,
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [ true, 'Please add password confirm' ],
		validate: {
			validator: function(val) {
				return val === this.password;
			},
			message: 'password are not the same'
		},
		select: false
	},
	passwordChangedAt: Date,
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now
	}
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
	if (!this.isModified('password')) return next();
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);

	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', async function(next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = Date.now() - 1000;
	next();
});

// Create signed JWT
userSchema.methods.createSignedJwtToken = function() {
	return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE_IN
	});
};

// match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.checkIfUserChangePasswordAfter = function(JwtTimestamp) {
	if (this.passwordChangedAt) {
		const passwordChangedAtTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JwtTimestamp < passwordChangedAtTimestamp; // true => password changed
	}
	return false;
};

// Generate random reset token
userSchema.methods.generateResetPasswordToken = function() {
	// 1) Create random token
	const resetToken = crypto.randomBytes(32).toString('hex');
	// 2) Create hash token and save it to database
	const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	this.resetPasswordToken = hashedToken;
	// 3) craete expires time for token and save it to database
	const expiresTime = Date.now() + 10 * 60 * 1000;
	this.resetPasswordExpire = expiresTime;

	// 4) return regular token not the hashed token
	return resetToken;
};

module.exports = mongoose.model('User', userSchema);
