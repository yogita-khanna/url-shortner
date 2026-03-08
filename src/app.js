require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const urlRoutes = require("./routes/url.routes");

const app = express();

connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("URL Shortener Service Running");
});

app.use("/", urlRoutes);

app.use((err, req, res, next) => {
  console.error("Express Error Handler:", err.stack);
  res.status(500).json({ error: "Interal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running - http://localhost:${PORT}`);
});
