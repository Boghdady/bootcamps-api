const fs = require('fs');
const path = require('path');
const colors = require('colors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bootcamp = require('../models/bootcampModel');

dotenv.config({ path: '../config/config.env' });

// connet to DB
mongoose.connect(process.env.MONGODB_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
});

// Read Files
const bootcamps = JSON.parse(fs.readFileSync('../_data/bootcamps.json'));

// Insert data into DB
const insertData = async () => {
	try {
		await Bootcamp.create(bootcamps);
		console.log('Data Inserted'.green.inverse);
	} catch (error) {
		console.log(error);
	}
};

// Delete data from DB
const destroyData = async () => {
	try {
		await Bootcamp.deleteMany();
		console.log('Data Destroyed'.red.inverse);
		process.exit();
	} catch (error) {
		console.log(error);
	}
};

if (process.argv[2] === '-i') {
	insertData();
} else if (process.argv[2] === '-d') {
	destroyData();
}
