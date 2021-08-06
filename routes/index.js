const express = require("express");
const router = express.Router();
const general = require("../controllers/general");
const queries = require("../controllers/queries");

router.get("/general", general.get);

router.get("/mysql-query", queries.selectAll);

module.exports = router;
