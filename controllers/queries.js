const dogql = require("../dogql");
const tables = dogql.tables();

exports.selectAll = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql.get(employees).select().retrieve();
  res.send(response);
};
exports.selectOne = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select([employees.EmployeeID])
    .retrieve();
  res.send(response);
};
exports.selectMultiple = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select([employees.EmployeeID, employees.LastName])
    .retrieve();
  res.send(response);
};
exports.findOne = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select()
    .find({ EmployeeID: 1 })
    .retrieve();
  res.send(response);
};

exports.findMultiple = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select()
    .find({
      TitleOfCourtesy: "Ms.",
      Title: "sales Representative",
      Country: "USA",
    })
    .retrieve();
  res.send(response);
};

exports.filterRaw = async (req, res, next) => {
  const products = tables.products;
  const response = await dogql
    .get(products)
    .select()
    .filterRaw("UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70")
    .retrieve();
  res.send(response);
};

exports.orderAsc = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select([employees.EmployeeID])
    .sort({ EmployeeID: 1 })
    .retrieve();
  res.send(response);
};

exports.orderDesc = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select([employees.EmployeeID])
    .sort({ EmployeeID: -1 })
    .retrieve();
  res.send(response);
};

exports.filterOrderAsc = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select([employees.EmployeeID])
    .find({
      TitleOfCourtesy: "Ms.",
      Title: "sales Representative",
      Country: "USA",
    })
    .sort({ EmployeeID: 1 })
    .retrieve();
  res.send(response);
};

exports.filterOrderDesc = async (req, res, next) => {
  const employees = tables.employees;
  const response = await dogql
    .get(employees)
    .select([employees.EmployeeID])
    .find({
      TitleOfCourtesy: "Ms.",
      Title: "sales Representative",
      Country: "USA",
    })
    .sort({ EmployeeID: -1 })
    .retrieve();
  res.send(response);
};

exports.filterRawOrderAsc = async (req, res, next) => {
  const products = tables.products;
  const response = await dogql
    .get(products)
    .select()
    .filterRaw("UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70")
    .sort({ ProductId: 1 })
    .retrieve();
  res.send(response);
};

exports.joinTable = async (req, res, next) => {
  const products = tables.products;
  const suppliers = tables.suppliers;
  const response = await dogql
    .get(products)
    .join(suppliers, {
      on: [products.SupplierID, suppliers.SupplierID],
    })
    .select([products.ProductName, suppliers.CompanyName])
    .retrieve();
  res.send(response);
};

exports.selectAs = async (req, res, next) => {
  const customers = tables.customers;
  const response = await dogql
    .get(customers)
    .selectAs([{ "Company Name": dogql.rename(customers.CompanyName) }])
    .retrieve();
  res.send(response);
};

exports.selectSelectAs = async (req, res, next) => {
  const customers = tables.customers;
  const response = await dogql
    .get(customers)
    .select([customers.CustomerID])
    .selectAs([{ "Company Name": dogql.rename(customers.CompanyName) }])
    .retrieve();
  res.send(response);
}

exports.selectAsStringFunction = async (req, res, next) => {
  const employees = tables.employees;
  // const response = await dogql.get(employees).select([employees.EmployeeID, "Country <> 'USA' AS overseas"]).retrieve();

  const response = await dogql
    .get(employees)
    .select([employees.EmployeeID])
    .selectAs([{ overseas: dogql.string("Country <> 'USA'") }])
    .retrieve();
  res.send(response);
};
