import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);

  //database connection
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGO_URI;

  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(" MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); 
  }
};

startServer();
