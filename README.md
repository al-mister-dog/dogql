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
npm i dogql-db
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
  database: 'database', 
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
### Insert
```insert``` takes a table as the first argument and an object as the second argument. The object is populated with the values you wish to insert into your table. The key of the object must match the field names specified in the sql table.
#### dogql
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
#### sql
```sql
INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');
```

### Update
```update``` takes a table as the first argument, and then an object. The object consists of two query objects, ```set``` and ```where```. ```set``` represents the values you want to update, and ```where``` specifies the table entry you wish to make your updates.
#### dogql
```javascript
dogql.update(customers, {
  set: { ContactName: 'Alfred Schmidt', City: 'Frankfurt' },
  where: { CustomerId: 1 }
})
```
#### sql
```sql
UPDATE Customers
SET ContactName = 'Alfred Schmidt', City= 'Frankfurt'
WHERE CustomerID = 1;
```

### Delete
#### Delete an Entry
#### Clear all Entries in Table
#### Delete a Table

## Models, Tables and Templates
#### Create Tables
#### Work with Existing Tables
#### Create Templates

## Queries
### Get and Select
The get method takes a table as an argument. This table must be specified within the controller.
```javascript
const employees = tables.employees
dogql.get(employees)
```
Once the table has been specified you can select an entry or value from this table by adding the select method.
The select method takes an array as an argument. The array will contain values from your table.
```javascript
dogql.get(employees)
.select([employees.FirstName, employees.LastName])
```
```sql
SELECT employees.FirstName, employees.LastName FROM employees
```
An empty argument will select all values from the table. This is the equivalent of the * wildcard in SQL
```javascript
dogql.get(employees)
.select()
```
```sql 
SELECT * FROM employees
```

### Query and Retrieve
```javascript
const dogql = require('dogql-db');
const tables = dogql.tables();

// exports.getEmployees = (req, res, send) => {
//   const employees = tables.employees
//   dogql.get(employees)
//   .select()
//   .limit(2)
//   .query(res)
// }

exports.getEmployees = async (req, res, send) => {
  const employees = tables.employees;
  console.log(employees)
  const results = await dogql.get(employees)
  .select()
  .retrieve();
  const employeeOne = results[0].LastName.toUpperCase();
  res.send(employeeOne);
};

exports.filterEmployees = (req, res, next) => {
  const employees = tables.employees
  
  dogql.get(employees)
  .select([employees.LastName])
  .filter({
    title: "Sales Representative",
    country: 'USA'
  })
  .query(res);
}

exports.selectAsFilter = (req, res, next) => {
  const employees = tables.employees
  dogql.get(employees)
  .selectAs([
  {"name": dogql.concat(employees.FirstName, '" "', employees.LastName)}, 
  {"blurb": dogql.rename(employees.Notes)}
  ])
  .filter({
    title: "Sales Representative",
    country: 'USA'
  })
  .retrieve()
  .then(result => {
    res.send(result)
  })
}

exports.sortById = (req, res, next) => {
  const employees = tables.employees
  dogql.get(employees)
  .select()
  .sort({EmployeeID: -1})
  .query(res)
}

exports.numFuncs = (req, res, next) => {
  const products = tables.products
  dogql.get(products)
  .select([dogql.sum(products.QuantityPerUnit), dogql.count(products.ProductID), dogql.avg(products.UnitsInStock)])
  .query(res)
}

exports.nestedNumFuncs = (req, res, next) => {
  const products = tables.products
  
  dogql.get(products)
  .select([
    dogql.sum(products.QuantityPerUnit), 
    dogql.count(products.ProductID), 
    dogql.avg(products.UnitsInStock)])
  .query(res)
}

exports.filterComplex = (req, res, next) => {
  const orders = tables.orders;

  const conditions = dogql.filterComplex
    .like({'CustomerID': 'V%'})
    .and()
    .between({'OrderID': [10806, 10850]})
    .set();

  dogql.get(orders)
  .select([orders.ShipCountry])
  .where(conditions)
  .query(res);
}

exports.insertPlayers = (req, res, next) => {
  const customers = tables.customers
  dogql.insertMany(customers, {
    CustomerId: '29389',
    CompanyName: 'Cardinal',
    ContactName: 'Tom B. Erichsen',
    ContactTitle: 'Tom B. Erichsen',
    Address: 'Skagen 21',
    City: 'Stavanger',
    Region: 'Stavanger',
    PostalCode: '4006',
    Country: 'Norway',
    Phone: '000-111-111',
    Fax:'111-333-222'
  })
}

exports.update = (req, res, next) => {
  const users = tables.users;

  dogql.update(users, {
    where: { id: 6 },
    set: { 
      email: 'almisterdog@gmail.com',
      name: 'Alex Hunter Cool'
    }
  })
}
```

### Basic Queries
#### Filter/Where
#### Sort/Order By
#### Group By
#### Pagination/Limit

### Joins

### Complex Queries
#### Nested Functions
#### Complex Filters

