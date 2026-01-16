const express = require("express")
const app = express();
app.set("trust proxy", true);
const compression = require("compression");
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const Version = require("./models/version");
const Log = require("./models/log");
require('dotenv').config();

console.log("process.env.NODE_ENV", process.env.NODE_ENV);

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not set");
}

const uri = process.env.DATABASE_URI;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log("Connected to database.");
  } catch {
    console.log("Failed to connect to database.");
  }
};

connectToDatabase();

const db = mongoose.connection;
db.on("error", (error) => console.error(error));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: uri
  }),
  cookie: { secure: process.env.NODE_ENV === "production" }
}));
app.use(flash());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const apiRoutes = require("./routes");

if (process.env.CORS_ORIGINS) {
  const corsOptions = {
    origin: process.env.CORS_ORIGINS.split(','),
    optionsSuccessStatus: 200,
    credentials: true
  };

  console.log("Cors options found. Adding CORS middleware.");
  app.use(cors(corsOptions));
}

app.use("/api/", apiRoutes);
app.use(compression());

const renderWithFlash = (template, additionalFields = []) => {
  return (req, res) => {
    const data = {
      title: template === "login" ? "Login - rifftales" : "Sign Up - rifftales",
      errors: req.flash("errors") || [],
      missing: req.flash("missing") || [],
      username: req.flash("username")[0] || "",
      email: req.flash("email")[0] || ""
    };

    additionalFields.forEach(field => {
      data[field] = req.flash(field)[0] || "";
    });

    res.render(template, data);
  };
};

app.get("/login", renderWithFlash("login"));
app.get("/register", renderWithFlash("register", ["bio", "location"]));

app.get("/ping", (req, res) => {
  const response = {
    message: "ping received",
    timestamp: new Date().toISOString()
  };

  if (mongoose.connection.readyState === 1) {
    response.database = "online";
  }

  res.json(response);
});

app.get("/version", async (req, res) => {
  try {
    const version = await Version.findOne().sort({ createdAt: -1 });
    if (!version) {
      return res.status(404).json({ error: "Version not found" });
    }
    res.json({
      version: version.version,
      description: version.description,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt
    });
  } catch (error) {
    console.error("Error fetching version:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use((err, req, res, next) => {
  Log.logError(err, req.user?.id || null, req.route?.path || req.path).catch(console.error);

  console.error("Unhandled error:", err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || err.statusCode || 500;

  res.status(statusCode).json({
    error: "Internal server error"
  });
});

app.listen(port, () => {
  console.log(`App started on port: ${port}`);
});
