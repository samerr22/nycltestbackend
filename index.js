import dotenv from "dotenv";

dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";


import newsJobRouter from "./routes/newsJob.route.js";
import newsRoutes from "./routes/newsRoutes.js";


const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nycl.io",
      "https://appp-80f77.web.app",
      "https://appp-80f77.firebaseapp.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("MERN WhatsApp Order API is running");
});


app.use("/api/internal/news", newsJobRouter);
app.use("/api/public/news", newsRoutes);

const PORT = process.env.PORT || 8080;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("❌ MongoDB connection failed:", error.message);
  });
