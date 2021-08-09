require("dotenv").config();
const dogql = require("../dogql");
const mysql = require("mysql2");

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

dogql.db(options);
const db = mysql.createConnection(options);

function getTables() {
  let dbTables = {};
  db.connect();
  return new Promise((resolve, reject) => {
    db.query("SHOW TABLES", (err, databaseTables) => {
      if (err) throw err;
      let count = 0;
      for (let i = 0; i < databaseTables.length; i++) {
        for (const [tableInDatabase, tableName] of Object.entries(
          databaseTables[i]
        )) {
          dbTables[tableName] = { title: tableName };
          db.query(`DESC ${tableName}`, (err, results) => {
            if (err) throw err;
            results.forEach((table) => {
              dbTables[tableName][table.Field] = table.Field;
              dbTables[tableName][
                table.Field + "KeyVal"
              ] = `${tableName}.${table.Field}`;
            });
            count++;
            if (count === 12) {
              resolve(dbTables);
            }
          });
        }
      }
    });
  });
}

function deleteUsers() {
  db.query("DELETE FROM users");
}

beforeAll(() => {
  db.query(
    `CREATE TABLE users (id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100), email VARCHAR(255), password VARCHAR(255))`
  );
});

describe("basic connection tests", () => {
  it("utilises mysql function", async () => {
    const tables = await getTables();
    expect(tables.categories.title).toBe("categories");
  });
  it("can work with methods", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql.get(employees).select().retrieve();
    expect(response).toBeTruthy();
  });
  it("sends the correct query to mysql", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql.get(employees).select().retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT * FROM employees");
  });
  it("sends expected data", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql.get(employees).select().retrieve();
    const results = response.array;
    const id = results[0].EmployeeID;
    expect(id).toBe("1");
  });
});

describe("select queries", () => {
  it("selects all fields from table", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql.get(employees).select().retrieve();
    const results = response.array;
    expect(results.length).toBe(9);
  });
  it("sends the correct select-all SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql.get(employees).select().retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT * FROM employees");
  });

  it("selects one field from table", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .retrieve();
    const results = response.array;
    expect(Object.keys(results[0])).toEqual(["EmployeeID"]);
  });
  it("sends the correct select-one SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT EmployeeID FROM employees");
  });

  it("selects multiple fields from table", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID, employees.LastName])
      .retrieve();
    const results = response.array;
    expect(Object.keys(results[0])).toEqual(["EmployeeID", "LastName"]);
  });
  it("sends the correct select-multiple SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID, employees.LastName])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT EmployeeID, LastName FROM employees");
  });
});

describe("filter queries", () => {
  it("filters one field by equality", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select()
      .find({ EmployeeID: 1 })
      .retrieve();
    const results = response.array;
    expect(results.length).toBe(1);
  });
  it("sends the correct find-one SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select()
      .find({ EmployeeID: 1 })
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT * FROM employees WHERE EmployeeID = '1'");
  });

  it("filters multiple fields by equality", async () => {
    const tables = await getTables();
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
    const results = response.array;
    expect(results.length).toBe(2);
  });
  it("sends the correct find-multiple SQL query", async () => {
    const tables = await getTables();
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
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT * FROM employees WHERE TitleOfCourtesy = 'Ms.' AND Title = 'sales Representative' AND Country = 'USA'"
    );
  });

  it("completes a filter-raw query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select()
      .filterRaw("UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70")
      .retrieve();
    let results = response.array;
    let array = results.map((obj) => obj.ProductID);
    expect(array).toEqual(["25", "34", "36", "40", "46", "73"]);
  });
  it("sends the correct filter-raw SQL query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select()
      .filterRaw("UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70")
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT * FROM products WHERE UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70"
    );
  });
});

describe("order-by queries", () => {
  it("orders fields ascending to descending", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .sort({ EmployeeID: 1 })
      .retrieve();
    const results = response.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  });
  it("sends the correct order-asc SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .sort({ EmployeeID: 1 })
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees ORDER BY EmployeeID ASC"
    );
  });

  it("orders fields ascending to descending", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .sort({ EmployeeID: -1 })
      .retrieve();
    const results = response.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["9", "8", "7", "6", "5", "4", "3", "2", "1"]);
  });
  it("sends the correct order-desc SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .sort({ EmployeeID: -1 })
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees ORDER BY EmployeeID DESC"
    );
  });
});

describe("order-by with filter queries", () => {
  it("orders filtered fields ascending to descending", async () => {
    const tables = await getTables();
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
    const results = response.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["1", "3"]);
  });
  it("sends the correct filter-order-asc SQL query", async () => {
    const tables = await getTables();
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
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees WHERE TitleOfCourtesy = 'Ms.' AND Title = 'sales Representative' AND Country = 'USA' ORDER BY EmployeeID ASC"
    );
  });

  it("orders filtered fields ascending to descending", async () => {
    const tables = await getTables();
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
    const results = response.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["3", "1"]);
  });
  it("sends the correct filter-order-desc SQL query", async () => {
    const tables = await getTables();
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
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees WHERE TitleOfCourtesy = 'Ms.' AND Title = 'sales Representative' AND Country = 'USA' ORDER BY EmployeeID DESC"
    );
  });

  it("completes a filter-raw-order query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select()
      .filterRaw("UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70")
      .sort({ ProductId: 1 })
      .retrieve();
    const results = response.array;
    let array = results.map((obj) => obj.ProductID);
    expect(array).toEqual(["25", "34", "36", "40", "46", "73"]);
  });
  it("sends the correct filter-raw-order SQL query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select()
      .filterRaw("UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70")
      .sort({ ProductId: 1 })
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT * FROM products WHERE UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70 ORDER BY ProductId ASC"
    );
  });
});

describe("join queries", () => {
  it("completes a join query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const suppliers = tables.suppliers;
    const response = await dogql
      .get(products)
      .join(suppliers, {
        on: [products.SupplierID, suppliers.SupplierID],
      })
      .select([products.ProductName, suppliers.CompanyName])
      .retrieve();
    const results = response.array;
    expect(Object.keys(results[0])).toEqual(["ProductName", "CompanyName"]);
  });
  it("sends the correct join SQL query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const suppliers = tables.suppliers;
    const response = await dogql
      .get(products)
      .join(suppliers, {
        on: [products.SupplierID, suppliers.SupplierID],
      })
      .select([products.ProductName, suppliers.CompanyName])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT ProductName, CompanyName FROM products JOIN suppliers ON products.SupplierID = suppliers.SupplierID"
    );
  });
});

describe("select-as queries", () => {
  it("completes a selectAs query", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .selectAs([{ "Company Name": dogql.rename(customers.CompanyName) }])
      .retrieve();
    const results = response.array;
    expect(results[0]).toEqual({ "Company Name": "Alfreds Futterkiste" });
  });
  it("sends the correct selectAs SQL query", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .selectAs([{ "Company Name": dogql.rename(customers.CompanyName) }])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT customers.CompanyName AS 'Company Name' FROM customers"
    );
  });

  it("chains a select and selectAs method", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select([customers.CustomerID])
      .selectAs([{ "Company Name": dogql.rename(customers.CompanyName) }])
      .retrieve();
    const results = response.array[0];
    expect(Object.keys(results)).toEqual(["CustomerID", "Company Name"]);
  });
  it("sends the correct select and selectAs SQL query", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select([customers.CustomerID])
      .selectAs([{ "Company Name": dogql.rename(customers.CompanyName) }])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT CustomerID, customers.CompanyName AS 'Company Name' FROM customers"
    );
  });

  it("chains a select, selectAs and string method", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .selectAs([{ overseas: dogql.string("Country <> 'USA'") }])
      .retrieve();
    const results = response.array;
    const booleans = {
      0: true,
      1: false,
    };
    const isOverseas = results.map(
      (obj) => (obj.overseas = booleans[obj.overseas])
    );
    expect(isOverseas).toEqual([
      true,
      true,
      true,
      true,
      false,
      false,
      false,
      true,
      false,
    ]);
  });
  it("sends the correct select-as-string-function SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .selectAs([{ overseas: dogql.string("Country <> 'USA'") }])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID, Country <> 'USA' AS 'overseas' FROM employees"
    );
  });
});

describe("function queries", () => {
  it("completes a count query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select([dogql.count(products.ProductID)])
      .retrieve();
    const results = response.array[0];
    const queryString = response.queryString;
    expect(results).toEqual({
      "COUNT(ProductID)": "77",
    });
  });
  it("sends the correct count SQL query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select([dogql.count(products.ProductID)])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT COUNT(ProductID) FROM products");
  });

  it("completes a sum query", async () => {
    const tables = await getTables();
    const order_details = tables.order_details;
    const response = await dogql
      .get(order_details)
      .select([dogql.sum(order_details.Quantity)])
      .retrieve();
    const results = response.array[0];
    expect(results).toEqual({
      "SUM(Quantity)": "51317",
    });
  });
  it("sends the correct sum SQL query", async () => {
    const tables = await getTables();
    const order_details = tables.order_details;
    const response = await dogql
      .get(order_details)
      .select([dogql.sum(order_details.Quantity)])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT SUM(Quantity) FROM order_details");
  });

  it("completes an avg query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select([dogql.avg(products.UnitPrice)])
      .retrieve();
    const results = response.array[0];
    expect(results).toEqual({
      "AVG(UnitPrice)": "28.86636363636364",
    });
  });
  it("sends the correct avg SQL query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select([dogql.avg(products.UnitPrice)])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe("SELECT AVG(UnitPrice) FROM products");
  });

  it("completes a concat query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .selectAs([
        { name: dogql.concat(employees.FirstName, '" "', employees.LastName) },
      ])
      .retrieve();
    const results = response.array[0];
    expect(results).toEqual({
      name: "Nancy Davolio",
    });
  });
  it("sends the correct concat SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .selectAs([
        { name: dogql.concat(employees.FirstName, '" "', employees.LastName) },
      ])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      `SELECT CONCAT(FirstName," ",LastName) AS 'name' FROM employees`
    );
  });
});

describe("multiple function queries", () => {
  it("completes a count, sum, avg query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select([
        dogql.sum(products.QuantityPerUnit),
        dogql.count(products.ProductID),
        dogql.avg(products.UnitsInStock),
      ])
      .retrieve();
    const results = response.array[0];
    expect(results).toEqual({
      "SUM(QuantityPerUnit)": "3381",
      "COUNT(ProductID)": "77",
      "AVG(UnitsInStock)": "40.5065",
    });
  });
  it("sends the correct count, sum avg SQL query", async () => {
    const tables = await getTables();
    const products = tables.products;
    const response = await dogql
      .get(products)
      .select([
        dogql.sum(products.QuantityPerUnit),
        dogql.count(products.ProductID),
        dogql.avg(products.UnitsInStock),
      ])
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT SUM(QuantityPerUnit), COUNT(ProductID), AVG(UnitsInStock) FROM products"
    );
  });
});

describe("group-by functions", () => {
  it("completes a group-by query", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select([customers.Country, dogql.count(customers.CustomerID)])
      .groupBy(customers.Country)
      .retrieve();
    const results = response.array[0];
    expect(results).toEqual({
      "COUNT(CustomerID)": "2",
      Country: "Norway",
    });
  });
  it("sends the correct group-by query", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select([customers.Country, dogql.count(customers.CustomerID)])
      .groupBy(customers.Country)
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT COUNT(CustomerID), Country FROM customers GROUP BY Country"
    );
  });
});

describe("filter-object methods", () => {
  it("uses like-and-between", async () => {
    const tables = await getTables();
    const orders = tables.orders;
    const conditions = dogql.filter
      .like({ CustomerID: "V%" })
      .and()
      .between({ OrderID: [10806, 10850] })
      .set();
    const response = await dogql
      .get(orders)
      .select([orders.ShipCountry, orders.OrderID])
      .where(conditions)
      .retrieve();

    const results = response.array;
    expect(results[0]).toEqual({
      ShipCountry: "France",
      OrderID: "10806",
    });
  });

  it("uses greater-than", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const conditions = dogql.filter.gtn({ EmployeeID: "8" }).set();
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .where(conditions)
      .retrieve();

    const results = response.array[0];
    expect(results.EmployeeID).toBe("9");
  });
  it("uses less-than", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const conditions = dogql.filter.ltn({ EmployeeID: "2" }).set();
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .where(conditions)
      .retrieve();

    const results = response.array[0];
    expect(results.EmployeeID).toBe("1");
  });
  it("uses less-than-equal", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const conditions = dogql.filter.ltnEqual({ EmployeeID: "2" }).set();
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .where(conditions)
      .retrieve();

    const results = response.array[1];
    expect(results.EmployeeID).toBe("2");
  });
  it("uses greater-than-equal", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const conditions = dogql.filter.gtnEqual({ EmployeeID: "8" }).set();
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .where(conditions)
      .retrieve();

    const results = response.array[0];
    expect(results.EmployeeID).toBe("8");
  });
  it("uses equal", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const conditions = dogql.filter.equal({ EmployeeID: "1" }).set();
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .where(conditions)
      .retrieve();

    const results = response.array[0];
    expect(results.EmployeeID).toBe("1");
  });
  it("uses not-equal", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const conditions = dogql.filter.notEqual({ EmployeeID: "1" }).set();
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .where(conditions)
      .retrieve();

    const results = response.array[0];
    expect(results.EmployeeID).toBe("2");
  });

  it("uses 'in'", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select()
      .where(dogql.filter.in({ country: ["Germany", "France", "UK"] }).set())
      .retrieve();
    const results = response.array;
    expect(results[0].CustomerID).toBe("ALFAA");
  });
  it("sends the correct 'in' query", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select()
      .where(dogql.filter.in({ country: ["Germany", "France", "UK"] }).set())
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT * FROM customers WHERE country IN ('Germany','France','UK')"
    );
  });

  it("uses 'or", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const conditions = dogql.filter
      .equal({ City: "Berlin" })
      .or()
      .equal({ City: "München" })
      .set();
    const response = await dogql
      .get(customers)
      .select([customers.City])
      .where(conditions)
      .retrieve();
    const array = response.array;
    expect(array).toEqual([{ City: "Berlin" }, { City: "München" }]);
  });
  it("uses 'not in'", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select()
      .where(dogql.filter.notIn({ country: ["Germany", "France", "UK"] }).set())
      .retrieve();
    const results = response.array;
    expect(results[0].CustomerID).toBe("29389");
  });
  it("sends the correct 'not in' query", async () => {
    const tables = await getTables();
    const customers = tables.customers;
    const response = await dogql
      .get(customers)
      .select()
      .where(dogql.filter.notIn({ country: ["Germany", "France", "UK"] }).set())
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT * FROM customers WHERE country NOT IN ('Germany','France','UK')"
    );
  });
});

describe("case functions", () => {
  it("returns a case function", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .condition({
        when: [
          { "EmployeeID > 4": "The ID is greater than 4" },
          { "EmployeeID = 4": "The ID is 4" },
        ],
        $else: "The ID is less than 4",
        endAs: "ID_Number",
      })
      .retrieve();
    const results = response.array[0];
    expect(results).toEqual({
      EmployeeID: "2",
      ID_Number: "The ID is less than 4",
    });
  });
  it("sends the correct case function SQL query", async () => {
    const tables = await getTables();
    const employees = tables.employees;
    const response = await dogql
      .get(employees)
      .select([employees.EmployeeID])
      .condition({
        when: [
          { "EmployeeID > 4": "The ID is greater than 4" },
          { "EmployeeID = 4": "The ID is 4" },
        ],
        $else: "The ID is less than 4",
        endAs: "ID_Number",
      })
      .retrieve();
    const queryString = response.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID, CASE  WHEN EmployeeID > 4 THEN 'The ID is greater than 4' WHEN EmployeeID = 4 THEN 'The ID is 4' ELSE 'The ID is less than 4' END AS 'ID_Number' FROM employees"
    );
  });
});

describe("crud operations", () => {
  const resultSetHeader = [
    "fieldCount",
    "affectedRows",
    "insertId",
    "info",
    "serverStatus",
    "warningStatus",
  ];
  it("inserts a user", async () => {
    deleteUsers();
    const tables = await getTables();
    const users = tables.users;
    const response = await dogql.insert(users, {
      name: "alex",
      email: "al@mail.com",
      password: "abc",
    });
    expect(Object.keys(response)).toEqual(resultSetHeader);
  });
  it("updates a user", async () => {
    const tables = await getTables();
    const users = tables.users;
    const userToInsert = {
      name: "alex",
      email: "al@mail.com",
      password: "abc",
    };
    const userUpdates = {
      name: "herbie",
      email: "herbie@mail.com",
      password: "123",
    };

    await dogql.insert(users, userToInsert);
    const userResponse = await dogql.get(users).select().retrieve();
    const user = userResponse.array[0];
    const userId = user.id;

    await dogql.update(users, {
      set: userUpdates,
      where: { name: "alex" },
    });

    const updatedUserResponse = await dogql.get(users).select().retrieve();
    const updatedUser = updatedUserResponse.array[0];
    const updatedUserId = updatedUser.id;
    expect(userId).toBe(updatedUserId);
    expect(user).not.toEqual(updatedUser);
  });
  it("deletes a user", async () => {
    deleteUsers();
    const tables = await getTables();
    const users = tables.users;
    const response = await dogql.delete(users, { name: "alex" });
    expect(Object.keys(response)).toEqual(resultSetHeader);
  });
  it("deletes all entries in a table", async () => {
    const tables = await getTables();
    const users = tables.users;
    const response = await dogql.clearTable(users);
    expect(Object.keys(response)).toEqual(resultSetHeader);
  });
  it("deletes a table", async () => {
    const tables = await getTables();
    const users = tables.users;
    const response = await dogql.deleteTable(users);
    expect(Object.keys(response)).toEqual(resultSetHeader);
  });
});
