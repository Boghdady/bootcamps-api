const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middleware/errorHandler');

// Route files
const connectDB = require('./config/db');
const bootcamps = require('./routes/bootcampRoutes');

// Load env vars
dotenv.config({ path: './config/config.env' });
// Connect to database
connectDB();

const app = express();
app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers
app.use('/api/v1/bootcamps', bootcamps);
// Handle undefined routs
app.all('*', (req, res, next) => {
  next(new AppError(`Cant't find ${req.originalUrl} on this server`, 404));
});
// GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;
const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & Exit proccess
  server.close(() => process.exit(1));
});
