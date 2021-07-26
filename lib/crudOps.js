const utils = require('./qbUtils');
const mysql = require('mysql2');

let db;

exports.db = function(options) {
  db = mysql.createConnection(options);
  
  db.connect((err) => {
    if (err) {
      console.log('error at line 10 database.js')
    }
    console.log('crud accessed db!');
  });
};

exports.insert = (title, object) => {
  let fields = []
  let valueArraysToPush = []
  let values = [];
  let valueLength;

  for (const [key, value] of Object.entries(object)) {
    fields.push(`${key}`)
    valueArraysToPush.push(value)
    valueLength = value.length
  }
  if (typeof valueArraysToPush[0] === 'object') {
    for (let i = 0; i < valueLength ; i++) {
      let valueArrays = []
       valueArraysToPush.forEach(value => {
         if (value[i] === parseInt(value[i])) { 
           console.log(value[i])
           valueArrays.push(value[i])  
         } else {
           valueArrays.push(`${value[i]}`)
         }
       })
      values.push(valueArrays)
     }
  } else {
    let valArray = []
    valueArraysToPush.forEach(valueArray => {
      valArray.push(`${valueArray}`)
    })
    values.push(valArray)
  }
  fields = fields.join(', ')
  console.log(values)
  let sql = `INSERT INTO ${title.title} (${fields}) VALUES ?`
  console.log(sql)
  db.query(sql, [values], (err, result) => { 
    if (err) {
      console.log(result)
      throw err;
    }
    console.log(result);
  });
}

exports.update = (table, object) => {
  const tableToUpdate = table.title;
  const conditionsArray = utils.sanitiseArray(object.where);
  const valueConditions = utils.createWhereQueries(conditionsArray);
  const sets = utils.createSetQueries(object.set);
  const valuesToUpdate = sets.join(', ');
  const sql = `UPDATE ${tableToUpdate} SET ${valuesToUpdate}${valueConditions}`;
  db.query(sql, (err, result) => { 
    if (err) {
      console.log(result)
      throw err;
    }
    console.log(result);
  });
};

exports.delete = (table, object) => {
  const tableToUpdate = table.title;
  const conditionsArray = utils.sanitiseArray(object);
  const valuesToDelete = utils.createWhereQueries(conditionsArray);
  const sql = `DELETE FROM ${tableToUpdate}${valuesToDelete}`;

  db.query(sql, (err, result) => { 
    if (err) {
      console.log(result)
      throw err;
    }
    console.log(result);
  });
}

exports.clearTable = (table) => {
  const tableToDelete = table.title;
  const sql = `DELETE FROM ${tableToDelete}`;
  db.query(sql, (err, result) => { 
    if (err) {
      console.log(result)
      throw err;
    }
    console.log(result);
  });
};

exports.deleteTable = (table) => {
  const tableToDelete = table.title;
  const sql = `DROP TABLE ${tableToDelete}`;
  db.query(sql, (err, result) => { 
    if (err) {
      console.log(result)
      throw err;
    }
    console.log(result);
  }); 
};