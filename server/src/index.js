import "./config/env.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pregnancyRoutes from "./routes/pregnancyRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import tipRoutes from "./routes/tipRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());


try {
  await connectDB();
} catch (error) {
  console.error("Startup database connection failed. Exiting...");
  process.exit(1);
}






app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pregnancies", pregnancyRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/tips", tipRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/inventory", inventoryRoutes);


app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SafeMother API Server",
  });
});


app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
