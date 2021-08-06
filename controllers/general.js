const dogql = require("../dogql");
const tables = dogql.tables();

exports.get = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql.get(employees).select().retrieve();
  res.send(response)
};
