const express = require("express")
const app = express();
const compression = require("compression");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require('dotenv').config();

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
const uri = process.env.DATABASE_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database."));

app.use(express.json());

// Set up EJS as the view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const apiRoutes = require("./routes");

const corsOptions = {
  origin: ["http://127.0.0.1:5173", "http://localhost:5173"],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use("/api/", apiRoutes);
app.use(compression());

app.get("/login", (req, res) => {
  res.render("login", { title: "Login - Guitar DB" });
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`);
});