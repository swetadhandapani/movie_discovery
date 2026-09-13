import mongoose from "mongoose";
import { env } from "./config.js";

export async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected");
}
