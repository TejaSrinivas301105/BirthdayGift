const mongoose = require('mongoose');

let isMockMode = false;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.log('\x1b[33m%s\x1b[0m', '⚠️ MONGO_URI is not set. Running in MOCK DATABASE mode (using local JSON file store).');
    isMockMode = true;
    return { isMockMode: true };
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connected to MongoDB Successfully: ${conn.connection.host}`);
    return { isMockMode: false };
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.log('\x1b[33m%s\x1b[0m', '⚠️ Failed to connect to MongoDB Atlas. Falling back to MOCK DATABASE mode.');
    isMockMode = true;
    return { isMockMode: true };
  }
};

const getIsMockMode = () => isMockMode;

module.exports = { connectDB, getIsMockMode };
