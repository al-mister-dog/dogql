const express = require("express");
const router = express.Router();
const dogql = require("dogql");
const tables = dogql.tables();

router.get('/get', (req, res, next) => {
  const employees = tables.employees;
  console.log(employees)
  dogql.get(employees)
  .select()
  .query(res)
})

module.exports = router;
