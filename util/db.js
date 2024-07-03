const mongoose = require("mongoose");

mongoose.set('strictQuery', true);

const connectDB = async (URI) => {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
};

module.exports = {
  connectDB,
};
