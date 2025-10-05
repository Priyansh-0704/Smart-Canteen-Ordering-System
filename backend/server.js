import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import canteenRoutes from "./routes/canteen.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import customerRoutes from "./routes/customer.routes.js";
import cartRoutes from "./routes/cart.routes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));

// Middleware to parse JSON & form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.send("✅ Canteen Management API is running");
});

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v3/admin", adminRoutes);
app.use("/api/v3/canteens", canteenRoutes);
app.use("/api/v4/canteen-menu", menuRoutes);
app.use("/api/v5/customer", customerRoutes);
app.use("/api/v6/cart", cartRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Database connection
const startServer = async () => {
  const PORT = process.env.PORT || 5000;
  const MONGO_URI = process.env.MONGO_URI;

  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB disconnected on app termination");
  process.exit(0);
});