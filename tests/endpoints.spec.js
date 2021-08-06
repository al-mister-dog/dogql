const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);
const dogql = require("../dogql");
beforeAll(async () => {
  await dogql.db({
    host: "localhost",
    user: "root",
    password: "Coltrane67",
    database: "northwind",
  });
});

describe("test query builder", () => {
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
  it("receives expected data", async () => {
    const response = await request.get("/mysql-query");
    const results = response.body.array;
    const id = results[0].EmployeeID;
    expect(id).toBe("1");
  });
});
