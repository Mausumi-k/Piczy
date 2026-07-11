const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pixelia';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to the MongoDB database.');
  } catch (err) {
    console.error('Error opening database', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
