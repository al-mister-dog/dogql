const mysql = require("mysql2");
const qb = require("./lib/query-builder");
const crud = require("./lib/crud-ops");
const dbQ = require("./lib/db-query");
const cb = require("./lib/create-tables");

//DATABASE CONNECTION AND CREATE TABLE-OBJECT MAPPERS
let db;
let dbTables = {};
exports.db = function (options) {
  db = mysql.createConnection(options);

  db.connect((err) => {
    if (err) {
      console.log("error at line 10 database.js");
    }
    console.log("mysql up and running!");
  });

  crud.db(options);

  db.query("SHOW TABLES", (err, databaseTables) => {
    if (err) throw err;
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
        });
      }
    }
  });
};

//DB QUERIES
exports.query = function (res) {
  dbQ.query(res, db);
};
exports.retrieve = function () {
  return dbQ.retrieve(db);
};

//SEND TABLE-OBJECT MAPPERS TO APPLICATION
exports.tables = function () {
  return dbTables;
};

//CREATE QUERY/TABLE TEMPLATES
exports.template = (object) => {
  return qb.template(object);
};

//CREATE TABLE MODELS
exports.createTable = (object) => {
  return cb.createTable(object, db);
};

//CRUD OPERATIONS
exports.insert = (title, object) => {
  return crud.insert(title, object);
};

exports.insertMany = (title, array) => {
  return crud.insertMany(title, array)
}

exports.update = (table, object) => {
  return crud.update(table, object);
};

exports.delete = (table, object) => {
  return crud.delete(table, object);
};

exports.clearTable = (table) => {
  return crud.clearTable(table);
};

exports.deleteTable = (table) => {
  return crud.deleteTable(table);
};

//QUERY BUILDER
exports.get = (selected) => {
  qb.get(selected);
  return this;
};

exports.select = (selected) => {
  qb.select(selected);
  return this;
};

exports.selectAs = (selected) => {
  qb.selectAs(selected);
  return this;
};

exports.join = (table, on) => {
  qb.join(table, on);
  return this;
};

exports.find = (selected) => {
  qb.find(selected);
  return this;
};

exports.tableFilter = (selected) => {
  qb.tableFilter(selected);
  return this;
};

exports.filterRaw = (selected) => {
  qb.filterRaw(selected);
  return this;
};

exports.sort = (selectedObject) => {
  qb.sort(selectedObject);
  return this;
};

exports.groupBy = (selected) => {
  qb.groupBy(selected);
  return this;
};

exports.limit = (selected) => {
  qb.limit(selected);
  return this;
};

exports.where = (selected) => {
  qb.where(selected);
  return this;
};

//AGGREGATE FUNCTIONS
exports.rename = (name) => {
  qb.rename(name, dbTables);
};

exports.concat = (...args) => {
  qb.concat(...args);
};

exports.sum = (str) => {
  qb.sum(str);
};

exports.avg = (str) => {
  qb.avg(str);
};

exports.count = (str) => {
  qb.count(str);
};

exports.string = (str) => {
  qb.string(str);
};

exports.filter = qb.filter;

exports.condition = (object) => {
  qb.condition(object);
  return this;
}
exports.nest = () => {
  return qb.nest();
};

//CREATE TABLE
//data types
exports.string = 'VARCHAR(255)'
exports.number = 'INT'
exports.id = 'INT NOT NULL PRIMARY KEY'
exports.autoId = 'INT NOT NULL PRIMARY KEY AUTO_INCREMENT'
exports.date = `DATE`
exports.timeStamp = `TIMESTAMP`
exports.image = `IMAGE`
exports.boolean = `BOOL`
exports.double = `DOUBLE`
//constraints
exports.notNull = `NOT NULL`
exports.unique =`UNIQUE`
exports.primaryKey = `PRIMARY KEY`
exports.foreignKey = `FOREIGN KEY`
exports.check = (conditions) => {
  return `CHECK(${conditions})`
}
exports.default = (text) => {
  return `DEFAULT ${text}`
}

//NUMERIC DATA TYPES
//integer types
exports.tinyInt = `TINYINT`
exports.smallInt = `SMALLINT`
exports.mediumInt = `MEDIUMINT	`
exports.int = `INT	`
exports.bigInt = `BIGINT`
//float types
exports.float = `FLOAT()`
exports.decimal = `DECIMAL()`
exports.double = `DOUBLE`

//DATE AND TIME TYPES
exports.date = `DATE`
exports.datetime = `DATETIME()`
exports.timestamp = `TIMESTAMP()`
exports.time = `TIME()`
exports.year = `YEAR`