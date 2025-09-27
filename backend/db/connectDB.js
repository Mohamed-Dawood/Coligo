import mongoose from 'mongoose';
export const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log('DB connected successfully...');
  } catch (error) {
    console.log('Error in connecting DB : ', error);
    throw new Error(error);
  }
};
