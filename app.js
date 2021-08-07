const express = require("express");
const app = express();
const dogql = require("./dogql");
const tables = require("./tables")
require('dotenv').config()
app.use(express.json());

dogql.db({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const routes = require("./routes/index");
app.use("/", routes);

module.exports = app;
