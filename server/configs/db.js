import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database Connected")
    );
    console.log(`${process.env.MONGODB_URI}/quickgpt`);
    await mongoose.connect(`${process.env.MONGODB_URI}/quickgpt`);
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDB;
