const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGODB_URI, {
			useNewUrlParser: true,
			useCreateIndex: true,
			useFindAndModify: false,
			useUnifiedTopology: true
		});

		console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

module.exports = connectDB;
