const express = require("express")
const app = express();
const compression = require("compression");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
require('dotenv').config();

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
const uri = process.env.DATABASE_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database."));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up session and flash
app.use(session({
  secret: process.env.SESSION_SECRET || "guitardbsecret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === "production" }
}));
app.use(flash());

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
  res.render("login", { 
    title: "Login - Guitar DB",
    errors: req.flash("errors") || [],
    missing: req.flash("missing") || [],
    username: req.flash("username")[0] || "",
    email: req.flash("email")[0] || ""
  });
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`);
});