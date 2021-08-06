const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const dogql = require("../dogql");
beforeAll(() => {
  dogql.db({
    host: "localhost",
    user: "root",
    password: "Coltrane67",
    database: "northwind",
  });
});

describe("basic connection tests", () => {
  it("works in jest", async () => {
    const employees = { title: "employees" };
    const response = await dogql.get(employees).select().retrieve();
    expect(response).toBeTruthy();
  });
  it("can work with endpoints", async () => {
    const response = await request.get("/general");
    const results = response.body.array;
    expect(results).toBeTruthy();
  });
  it("sends the correct query to mysql", async () => {
    const response = await request.get("/mysql-query");
    const queryString = response.body.queryString;
    expect(queryString).toBe("SELECT * FROM employees");
  });
  it("sends expected data", async () => {
    const response = await request.get("/mysql-query");
    const results = response.body.array;
    const id = results[0].EmployeeID;
    expect(id).toBe("1");
  });
});

describe("select queries", () => {
  it("selects all fields from table", async () => {
    const response = await request.get("/select-all");
    const results = response.body.array;
    expect(results.length).toBe(9);
  });
  it("sends the correct select-all SQL query", async () => {
    const response = await request.get("/select-all");
    const queryString = response.body.queryString;
    expect(queryString).toBe("SELECT * FROM employees");
  });

  it("selects one field from table", async () => {
    const response = await request.get("/select-one");
    const results = response.body.array;
    expect(Object.keys(results[0])).toEqual(["EmployeeID"]);
  });
  it("sends the correct select-one SQL query", async () => {
    const response = await request.get("/select-one");
    const queryString = response.body.queryString;
    expect(queryString).toBe("SELECT EmployeeID FROM employees");
  });

  it("selects multiple fields from table", async () => {
    const response = await request.get("/select-multiple");
    const results = response.body.array;
    expect(Object.keys(results[0])).toEqual(["EmployeeID", "LastName"]);
  });
  it("sends the correct select-multiple SQL query", async () => {
    const response = await request.get("/select-multiple");
    const queryString = response.body.queryString;
    expect(queryString).toBe("SELECT EmployeeID, LastName FROM employees");
  });
});

describe("filter queries", () => {
  it("filters one field by equality", async () => {
    const response = await request.get("/find-one");
    const results = response.body.array;
    expect(results.length).toBe(1);
  });
  it("sends the correct find-one SQL query", async () => {
    const response = await request.get("/find-one");
    const queryString = response.body.queryString;
    expect(queryString).toBe("SELECT * FROM employees WHERE EmployeeID = '1'");
  });

  it("filters multiple fields by equality", async () => {
    const response = await request.get("/find-multiple");
    const results = response.body.array;
    expect(results.length).toBe(2);
  });
  it("sends the correct find-multiple SQL query", async () => {
    const response = await request.get("/find-multiple");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT * FROM employees WHERE TitleOfCourtesy = 'Ms.' AND Title = 'sales Representative' AND Country = 'USA'"
    );
  });

  it("completes a filter-raw query", async () => {
    const response = await request.get("/filter-raw");
    const results = response.body.array;
    let array = results.map((obj) => obj.ProductID);
    expect(array).toEqual(["25", "34", "36", "40", "46", "73"]);
  });
  it("sends the correct filter-raw SQL query", async () => {
    const response = await request.get("/filter-raw");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT * FROM products WHERE UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70"
    );
  });
});

describe("order-by queries", () => {
  it("orders fields ascending to descending", async () => {
    const response = await request.get("/order-asc");
    const results = response.body.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9"]);
  });
  it("sends the correct order-asc SQL query", async () => {
    const response = await request.get("/order-asc");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees ORDER BY EmployeeID ASC"
    );
  });

  it("orders fields ascending to descending", async () => {
    const response = await request.get("/order-desc");
    const results = response.body.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["9", "8", "7", "6", "5", "4", "3", "2", "1"]);
  });
  it("sends the correct order-desc SQL query", async () => {
    const response = await request.get("/order-desc");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees ORDER BY EmployeeID DESC"
    );
  });
});

describe("order-by with filter queries", () => {
  it("orders filtered fields ascending to descending", async () => {
    const response = await request.get("/filter-order-asc");
    const results = response.body.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["1", "3"]);
  });
  it("sends the correct filter-order-asc SQL query", async () => {
    const response = await request.get("/filter-order-asc");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees WHERE TitleOfCourtesy = 'Ms.' AND Title = 'sales Representative' AND Country = 'USA' ORDER BY EmployeeID ASC"
    );
  });

  it("orders filtered fields ascending to descending", async () => {
    const response = await request.get("/filter-order-desc");
    const results = response.body.array;
    let array = results.map((obj) => obj.EmployeeID);
    expect(array).toEqual(["3", "1"]);
  });
  it("sends the correct filter-order-desc SQL query", async () => {
    const response = await request.get("/filter-order-desc");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID FROM employees WHERE TitleOfCourtesy = 'Ms.' AND Title = 'sales Representative' AND Country = 'USA' ORDER BY EmployeeID DESC"
    );
  });

  it("completes a filter-raw-order query", async () => {
    const response = await request.get("/filter-raw-order-asc");
    const results = response.body.array;
    let array = results.map((obj) => obj.ProductID);
    expect(array).toEqual(["25", "34", "36", "40", "46", "73"]);
  });
  it("sends the correct filter-raw-order SQL query", async () => {
    const response = await request.get("/filter-raw-order-asc");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT * FROM products WHERE UnitPrice BETWEEN 10 AND 20 AND UnitsInStock > 70 ORDER BY ProductId ASC"
    );
  });
});

describe("join queries", () => {
  it("completes a join query", async () => {
    const response = await request.get("/join-table");
    const results = response.body.array;
    expect(Object.keys(results[0])).toEqual(["ProductName", "CompanyName"]);
  });
  it("sends the correct join SQL query", async () => {
    const response = await request.get("/join-table");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT ProductName, CompanyName FROM products JOIN suppliers ON products.SupplierID = suppliers.SupplierID"
    );
  });
});

describe("select-as queries", () => {
  it("completes a selectAs query", async () => {
    const response = await request.get("/select-as");
    const results = response.body.array;
    expect(results[0]).toEqual({ "Company Name": "Alfreds Futterkiste" });
  });
  it("sends the correct selectAs SQL query", async () => {
    const response = await request.get("/select-as");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT customers.CompanyName AS 'Company Name' FROM customers"
    );
  });

  it("chains a select and selectAs method", async () => {
    const response = await request.get("/select-select-as");
    const results = response.body.array[0];
    expect(Object.keys(results)).toEqual(["CustomerID", "Company Name"]);
  });
  it("sends the correct select and selectAs SQL query", async () => {
    const response = await request.get("/select-select-as");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT CustomerID, customers.CompanyName AS 'Company Name' FROM customers"
    );
  });

  it("chains a select, selectAs and string method", async () => {
    const response = await request.get("/select-as-string-function");
    const results = response.body.array;
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
    const response = await request.get("/select-as-string-function");
    const queryString = response.body.queryString;
    expect(queryString).toBe(
      "SELECT EmployeeID, Country <> 'USA' AS 'overseas' FROM employees"
    );
  });
});
