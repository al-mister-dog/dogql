const express = require("express");
const app = express();
const dogql = require("./dogql");

app.use(express.json());

dogql.db({
  host: "localhost",
  user: "root",
  password: "Coltrane67",
  database: "northwind",
});

const routes = require("./routes");
app.use("/", routes);

module.exports = app;
