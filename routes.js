const express = require("express");
const router = express.Router();
const dogql = require("./dogql");
const tables = dogql.tables();

router.get('/get', async (req, res, next) => {
  const employees = tables.employees;
  dogql.get(employees)
  .select()
  .query(res)
})

module.exports = router;
