import dotenv from "dotenv";

//import mongoose, { connect } from "mongoose";
//import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
});
connectDB()








/*
import express from "express";
const app = express();
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR : ", error);
      throw new error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error", error);
  }
})();
*/

