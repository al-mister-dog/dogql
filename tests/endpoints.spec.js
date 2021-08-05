const dogql = require("../dogql");

const supertest = require("supertest");
const app = require("../app");
const request = supertest(app);

beforeAll(() => {
  return dogql.db({
    host: "localhost",
    user: "root",
    password: "Coltrane67",
    database: "northwind",
  });
});

describe("test query builder", () => {
  it("works in jest", async () => {
    // const tables = await dogql.tables();
    // const emps = tables.employees;
    // console.log(emps)
    const employees = {title: 'employees'};
    const response = await dogql.get(employees).select().retrieve();
    expect(response).toBeTruthy();
  });
});
