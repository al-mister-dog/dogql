const mysql = require('mysql2')
const qb = require('./lib/query-builder')
const crud = require('./lib/crud-ops')
const dbQ = require('./lib/db-query')
const cb = require('./lib/create-tables')

//DATABASE CONNECTION AND CREATE TABLE-OBJECT MAPPERS
let db;
let dbTables = {};
exports.db = function(options) {
  db = mysql.createConnection(options);
  
  db.connect((err) => {
    if (err) {
      console.log('error at line 10 database.js')
    }
    console.log('mysql up and running!');
  });

  crud.db(options);

  db.query('SHOW TABLES', (err, databaseTables) => { 
    if (err) throw err;
    for (let i = 0; i < databaseTables.length; i++) {
      for (const [tableInDatabase, tableName] of Object.entries(databaseTables[i])) {
        dbTables[tableName] = { title: tableName }
        db.query(`DESC ${tableName}`, (err, results) => { 
          if (err) throw err;
          results.forEach(table => {
            dbTables[tableName][table.Field] = table.Field;
            dbTables[tableName][table.Field + 'KeyVal'] = `${tableName}.${table.Field}`
          })
        })  
      }
    }
  });
};



//DB QUERIES
exports.query = function(res) {
  dbQ.query(res, db)
};
exports.retrieve = function() {
  return dbQ.retrieve(db)
};

//SEND TABLE-OBJECT MAPPERS TO APPLICATION
exports.tables = function() {
  return dbTables
}

//CREATE QUERY/TABLE TEMPLATES
exports.template = (object) => {
  return qb.template(object)
};

//CREATE TABLE MODELS
exports.createTable = (object) => {
  return cb.createTable(object, db)
}

//CRUD OPERATIONS
exports.insert = (title, object) => {
  crud.insert(title, object)
};

exports.update = (table, object) => {
  crud.update(table,object)
};

exports.delete = (table, object) => {
  crud.delete(table, object)
};

exports.clearTable = (table) => {
  crud.clearTable(table)
};

exports.deleteTable = (table) => {
  crud.deleteTable(table)
};




//QUERY BUILDER
exports.get = (selected) => {
  qb.get(selected)
  return this
};;

exports.select = (selected) => {
  qb.select(selected);
  return this
};

exports.selectAs = (selected) => {
  qb.selectAs(selected);
  return this
};

exports.join = (table, on) => {
  qb.join(table, on)
  return this
};

exports.find = (selected) => {
  qb.find(selected)
  return this
};

exports.tableFilter = (selected) => {
  qb.tableFilter(selected);
  return this
};

exports.sort = (selectedObject) => {
  qb.sort(selectedObject)
  return this;
};

exports.groupBy = (selected) => {
  qb.groupBy(selected)
  return this
};

exports.limit = (selected) => {
  qb.limit(selected)
  return this
};

exports.where = (selected) => {
  qb.where(selected)
  return this
};

//AGGREGATE FUNCTIONS
exports.rename = (name) => {
  qb.rename(name, dbTables)
};

exports.concat = (...args) => {
  qb.concat(...args)
};

exports.sum = (str) => {
  qb.sum(str)
};

exports.avg = (str) => {
  qb.avg(str)
};

exports.count = (str) => {
  qb.count(str)
};

exports.filter = qb.filter;
