require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const urlRoutes = require("./routes/url.routes");

const app = express();

// 1. Database Connection (MongoDB)
connectDB();

// 2. Body Parser (JSON Support)
app.use(express.json());

// 3. Health Check Endpoints
app.get("/", (req, res) => {
  res.send("URL Shortener Service Running");
});

// 4. API Routes Initialization
app.use("/", urlRoutes);

// 5. Global Error Handler (Graceful Failure)
app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err.stack);
  res.status(500).json({ error: "Interal Server Error" });
});

// 6. Server Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running - http://localhost:${PORT}`);
});
