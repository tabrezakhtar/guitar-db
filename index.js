const express = require("express")
const app = express();
const path = require("path");
const compression = require("compression");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
require('dotenv').config();

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
const uri = process.env.DATABASE_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database."));

app.use(express.json());

const apiRoutes = require("./routes");

const corsOptions = {
  origin: "http://127.0.0.1:5173",
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use("/api/", apiRoutes);

const root = path.join(__dirname, "./client", "build");
app.use(express.static(root));
app.use(compression());

app.listen(port, () => {
  console.log(`App started on port: ${port}`);
});