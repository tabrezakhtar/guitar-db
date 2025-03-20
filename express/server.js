const express = require("express");
// const cors = require("cors");
const serverless = require("serverless-http");
// const compression = require("compression");

// const mongoose = require("mongoose");
// const { MongoClient } = require("mongodb");


require("dotenv").config();

const app = express();

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
const uri = process.env.DATABASE_URI;
// mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// const db = mongoose.connection;
// db.on("error", (error) => console.error(error));
// db.once("open", () => console.log("Connected to database."));

app.use(express.json());

// const corsOptions = {
//   origin: "https://resilient-daifuku-4beeb8.netlify.app",
//   optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));

const apiRoutes = require("../routes");
app.use("/api/", apiRoutes);
app.use("/.netlify/functions/server/guitars", apiRoutes);

// app.use(compression());

module.exports = app;
module.exports.handler = serverless(app);

// const handler = serverless(app);
// module.exports.handler = async (event, context) => {
//   const result = await handler(event, context);
//   return result;
// };