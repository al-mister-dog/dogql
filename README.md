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
const dogql = require('dogql-db')

dogql.db({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'database', 
})
```
Access database tables in your controller files.
```javascript
const dogql = require('dogql-db');
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
##### dogql
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
##### sql
```sql
INSERT INTO Customers (CustomerName, ContactName, Address, City, PostalCode, Country)
VALUES ('Cardinal', 'Tom B. Erichsen', 'Skagen 21', 'Stavanger', '4006', 'Norway');
```

### Update
```update``` takes a table as the first argument, and then an object. The object consists of two query objects, ```set``` and ```where```. ```set``` represents the values you want to update, and ```where``` specifies the table entry you wish to make your updates.
##### dogql
```javascript
dogql.update(customers, {
  set: { ContactName: 'Alfred Schmidt', City: 'Frankfurt' },
  where: { CustomerId: 1 }
})
```
##### sql
```sql
UPDATE Customers
SET ContactName = 'Alfred Schmidt', City= 'Frankfurt'
WHERE CustomerID = 1;
```

### Delete
#### Delete an Entry
Specify the table in the first argument and describe the entry you want to delete in an object in the second argument.
Such an object could include an id for example.
##### dogql
```javascript
dogql.delete(customers, { CustomerName: 'Alfreds Futterkiste' })
```
##### sql
```sql
DELETE FROM Customers WHERE CustomerName = 'Alfreds Futterkiste'
```
#### Clear all Entries in Table
Specify the table in the argument and clear your table out. The table structure, attributes, and indexes will remain intact.
##### dogql
```javascript
dogql.clearTable(customers)
```
##### sql
```sql
DELETE FROM TABLE customers
```
#### Delete a Table
Take your rage out on your entire table and delete it completely using ```deleteTable()```
```javascript
dogql.deleteTable(customers)
```
##### sql
```sql
DROP TABLE customers
```

## Models, Tables and Templates
#### Create Table Models
You can create sql tables in dogql and use them as models in your application. They are similar to Schemas in mongoose. In a file (perhaps in your models folder), require dogql-db and use the `dogql.create()` function.
```javascript
const dogql = require('dogql-db');
const myTable = dogql.create();
```
This function takes an object to add your fields and data types.
```javascript
const myTable = dogql.create({
  id: dogql.id,
  name: dogql.string,
});
```
Common data types include the following
```sql
dogql.string = 'VARCHAR(255)'
dogql.number = 'INT'
dogql.id = 'INT NOT NULL PRIMARY KEY'
dogql.autoId = 'INT NOT NULL PRIMARY KEY AUTO_INCREMENT'
dogql.date = `DATE`
dogql.timeStamp = `TIMESTAMP`
```
Export your table from your file and import wherever you want.
#### Work with Existing Tables
If you have your database driver set up (see set up above), then accessing table variables is easy. In your controller folder require dogql-db and set a variable to ```dogql.tables()```
```javascript
const dogql = require('dogql-db');
const tables = dogql.tables();
```
These are only accesible in your controllers, and individual tables and values are accessed using object dot notation.
```javascript
exports.myController = (req, res, next) => {
const employees = tables.employees;
const employeeId = employees.id;
}

```
#### Create Templates
If you find your self making the same long-winded select statements (multiple fields, some joins, a filter etc) in your code, you can avoid repeating yourself by setting a template that you can use in your functions. In a new file, perhaps in your models folder, require dogql and set a variable to the ```dogql.table()``` function.
```javascript
const dogql = require('dogql-db');

const team = dogql.table();
```
This function takes an object in which to supply your table information. These are stored in key-value pairs. Available options are...
```javascript
table: //string
joinTable: //string
joinOn: //array containing matching fields e.g ['t1.t2id', 't2.id']
fields: //array containing fields e.g ['id', 'name']
filters: //string containing sql syntax,
orderBy: //string containing sql syntax,
functions: //not yet integrated(i don't think),
limit: //number
```
Here is an example below
```javascript
const footballTeam = dogql.table({
  table: 'players',
  joinTable: 'teams',
  joinOn: ['players.teamId', 'teams.id'],
  fields: ['players.firstName', 'teams.teamName'],
  filters: 'WHERE teams.id = 1'
});
```
```sql
SELECT players.firstName, teams.teamName FROM players
JOIN teams ON players.teamId = teams.id
WHERE teams.id = 1
```
Export ```footballTeam``` from its file and import into your controllers. Now you can simply use the get method to retrieve the table records specified by your template.
```javascript
const dogql = require('dogql-db');
const footballTeam = require('../my-folder/myFile');

exports.getFootballTeam = (req, res, next) => {
  dogql.get(footballTeam).query(res)
}
```
Calling this function would provide the following results
```javascript
[
  {
    "firstName": "Bernd",
    "teamName": "Arsenal"
  },
  {
    "firstName": "Hector",
    "teamName": "Arsenal"
  },
...etc, etc
]
```
You can append methods to the template as long as they do not clash with the template.
```javascript
dogql.get(footballTeam).sort({value: -1})query(res)
```
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
#### Query
To send a response directly to client, you can use the query method. This is good for testing but not neccesarily reccomended for production. The query method takes the nodejs response object as an argument
```javascript
exports.sendStuff = (req, res, next) => {
  const employees = tables.employees;
  dogql.get(employees)
  .select()
  .query(res)
}
```
This will send an object array to the client/front-end
#### Retrieve
To keep the response in your controller function use the retrieve method. Like mongoDb this is an async function and requires async-await or then block.
##### async-await
```javascript
exports.getEmployees = async (req, res, send) => {
  const employees = tables.employees;
  const results = await dogql.get(employees)
  .select()
  .retrieve();
  res.send(results);
};
```

##### then block
```javascript
exports.sendStuff = (req, res, next) => {
  const employees = tables.employees;
  dogql.get(employees)
  .select()
  .retrieve()
  .then((response) => {
    res.send(response)
  })
  .catch((err) => {
    console.log(err)
  })
}
```
This allows you to also use javascript methods on the retrieved object array sent from the database. This is useful if you want to manipulate your data in ways that would require more complex SQL queries to achieve (if you're tired basically).
```javascript
exports.getEmployees = async (req, res, send) => {
  const employees = tables.employees;
  const results = await dogql.get(employees)
  .select()
  .retrieve();
  const crazyFunc = results.reduce((a,b,x,z) => {
    a.slice(b.map(indexOf(d09q1 2u135), { key: new Set (...object.assign(...args))
      if (true === false) {pipe: arr.reduce(this.asyncPromise)}
    }, document.querySelector('div').push(1)), new RegExp('/|)[](_+(_,)|_ /2|_||_[-$/'))
  }); //nb this might not do anything
  res.send(crazyFunc);
};
```



### Basic Queries
#### Filter/Where
##### find
The simplest filter method is ```.find()```
This is an equality operator and works like the find method in mongoDb, in which the field matches the value.
```javascript
.find({id: 1})
```
This method is chained to your function after setting up the get and select functions.
```javascript
const employees = tables.employees
dogql.get(employees)
.select([employees.LastName, employees.FirstName, employees.Title, employees.City])
.find({title: "Sales Representative"})
.query(res);
```
```sql
SELECT LastName, FirstName, Title, City FROM employees WHERE title = 'Sales Representative'
```
This would render the following...
```javascript
[
  {
    "LastName": "Davolio",
    "FirstName": "Nancy",
    "Title": "Sales Representative",
    "City": "Seattle"
  },
  {
    "LastName": "Leverling",
    "FirstName": "Janet",
    "Title": "Sales Representative",
    "City": "Kirkland"
  }
  ...etc, etc
]
```
To add more equality operators just add more properties to your find object
```javascript
.find({
  title: "Sales Representative",
  country: 'USA'
})
```
It should go without saying that the strings can be replaced with variables of your choice
```javascript
.find({
  id: req.body.id
})
```
##### tableFilter
The ```tableFilter()``` method is similar to the ```find()``` method, except they may be easier to work with certain types of fetched data, especially when the field name is unknown by the server. For example
```javascript
await fetch('http://mywebsite/page', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field: 'employeeId',
          value: this.value
        })
      })
```
This would be be received by the server as ```[{field: 'employeeId, value: 23}]```
Back in node, you would deal with this in the following way
```javascript
///...
.tableFilter({field: req.body.field, value: req.body.value})
```
##### filter
To include more complex filters see the complex filters section below.
##### filterRaw
If you grow weary of pretending you are really working with objects you can always resort to using raw sql syntax for the filter function
```javascript
filterRaw(`VALUE > 25`)
```
#### Sort/Order By
The ```.sort()``` method takes an object as an argument. The object takes a field and order as a key value pair. Use 1 for ascending order and -1 for descending order.
```javascript
  .sort({[freight]: 1})
```
Add the key as a variable to access the correct value...
```javascript
  const orders = tables.orders;
  const freight = orders.Freight;
  
  dogql.get(orders)
  .select([orders.OrderID, orders.Freight])
  .sort({[freight]: 1})
  .query(res)
```
```sql
SELECT OrderId, Freight FROM orders ORDER BY Freight ASC
```
If the desired order is coming from the request use a ternary operator to determine the order.
```javascript
.sort({[freight]: order ? 1 : -1})
```
#### Group By
#### Pagination/Limit
Limit your results to the desired number with ```.limit()```
```javascript
dogql.get(hugeTable)
.select()
.limit(5)
```
### Joins

### Complex Queries
#### Nested Functions
#### Complex Filters

