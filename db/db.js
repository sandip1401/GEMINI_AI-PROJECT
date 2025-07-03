const mongoose=require('mongoose');
require('dotenv').config();
const URL=process.env.MONGO_URL
const connectDB = async () => {
    // console.log("========>db called")
    try {
        await mongoose.connect(URL);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;