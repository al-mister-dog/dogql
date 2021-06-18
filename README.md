# Easy to use Object-relational Mapper for Node.js and MySQL

Dogql uses a variety of tools to suit your preferred way of dealing with your MySql database.
Dogql allows you to work with your MySQL database in a variety of ways, from using Knex style query builders, creating your own schemas 
and handling data similar to MongoDb or Mongoose, to writing out your own raw queries. Dogql uses simple syntax for making complex queries.

```javascript
  const customers = tables.customers
  dogql.insert(customers, {
    CompanyName: 'Cardinal',
    ContactName: 'Tom B. Erichsen',
    Address: 'Skagen 21',
    City: 'Stavanger',
    PostalCode: '4006',
    Country: 'Norway',
  })
```
```sql
INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');
```
## Installation
```
npm i dogql
```
## Usage
### Pre-existing Database and Setup
Require dogql and set up the database driver using MySql options.
```javascript
const dogql = require('dogql')

dogql.db({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'northwind', 
})
```
Access database tables in your controller files.
```javascript
const dogql = require('dogql');
const tables = dogql.tables();
```
Access individual tables in your controller functions.
```javascript
exports.getEmployees = (req, res, send) => {
  const employees = tables.employees;
}
```
Select * from table and send.
```javascript
exports.getEmployees = (req, res, send) => {
  const employees = tables.employees
  dogql.get(employees)
  .select()
  .query(res)
}
```
### Fetch Data with Query and Retrieve
There are two ways to make responses with your table data.
Send an immediate response with ```query(res)```.
```javascript
exports.getEmployees = (req, res, send) => {
  const employees = tables.employees
  dogql.get(employees)
  .select()
  .query(res)
}
```
Fetch data and make changes before sending a response with ```retrieve```.
```javascript
exports.getEmployees = async (req, res, send) => {
  const employees = tables.employees;
  const results = await dogql.get(employees)
  .select()
  .retrieve();
  const employeeOne = results[0].LastName.toUpperCase();
  res.send(employeeOne);
};
//response: DAVOLIO
```
## CRUD Operations
### Update
```javascript
dogql.update(customers, {CustomerId: 1})
.set({ 
  ContactName: 'Alfred Schmidt',
  City: 'Frankfurt'
})
```