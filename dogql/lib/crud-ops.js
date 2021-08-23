const utils = require("./qb-utils");
const mysql = require("mysql2");

let db;

exports.db = function (options) {
  db = mysql.createConnection(options);

  db.connect((err) => {
    if (err) {
      console.log("keir starmer"); // TODO sort it out
    }
    console.log("crud accessed db!");
  });
};

function getResults(sql, values) {
  if (values) {
    return new Promise((resolve, reject) => {
      db.query(sql, [values], (err, results) => {
        if (err) throw reject(err);
        resolve(results);
      });
    });
  }
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) throw reject(err);
      resolve(results);
    });
  });
}
function getInsertResults(sql, values) {
  return new Promise((resolve, reject) => {
    db.query(sql, [values], (err, results) => {
      if (err) throw reject(err);
      resolve(results);
    });
  });
}

function getResultsFromString(sql) {
  return new Promise((resolve, reject) => {
    db.query(sql, (err, results) => {
      if (err) throw reject(err);
      resolve(results);
    });
  });
}

exports.insert = async (title, object) => {
  let fields = [];
  let valueArraysToPush = [];
  let values = [];
  let valueLength;

  for (const [key, value] of Object.entries(object)) {
    fields.push(`${key}`);
    valueArraysToPush.push(value);
    valueLength = value.length;
  }
  if (typeof valueArraysToPush[0] === "object") {
    for (let i = 0; i < valueLength; i++) {
      let valueArrays = [];
      valueArraysToPush.forEach((value) => {
        if (value[i] === parseInt(value[i])) {
          console.log(value[i]);
          valueArrays.push(value[i]);
        } else {
          valueArrays.push(`${value[i]}`);
        }
      });
      values.push(valueArrays);
    }
  } else {
    let valArray = [];
    valueArraysToPush.forEach((valueArray) => {
      valArray.push(`${valueArray}`);
    });
    values.push(valArray);
  }
  fields = fields.join(", ");
  let sql = `INSERT INTO ${title.title} (${fields}) VALUES ?`;
  const response = await getInsertResults(sql, values);
  return response;
};

exports.insertMany = async (title, array) => {
  let fields = [];
  let values = [];
  fields.push(Object.keys(array[0]));
  array.forEach((object) => {
    for (let [key, value] of Object.entries(object)) {
      object[key] = `"${value}"`;
    }
    values.push(`(${Object.values(object)})`);
  });
  fields = fields.join(", ");
  values = values.join();
  const sql = `INSERT INTO ${title.title} (${fields}) VALUES ${values}`;
  const response = await getResults(sql);
  return response
}

exports.update = async (table, object) => {
  const tableToUpdate = table.title;
  const conditionsArray = utils.sanitiseArray(object.where);
  const valueConditions = utils.createWhereQueries(conditionsArray);
  const sets = utils.createSetQueries(object.set);
  const valuesToUpdate = sets.join(", ");
  const sql = `UPDATE ${tableToUpdate} SET ${valuesToUpdate}${valueConditions}`;
  const response = await getResults(sql);
  return response;
};

exports.delete = async (table, object) => {
  const tableToUpdate = table.title;
  const conditionsArray = utils.sanitiseArray(object);
  const valuesToDelete = utils.createWhereQueries(conditionsArray);
  const sql = `DELETE FROM ${tableToUpdate}${valuesToDelete}`;
  const response = await getResults(sql);
  return response;
};

exports.clearTable = async (table) => {
  const tableToDelete = table.title;
  const sql = `DELETE FROM ${tableToDelete}`;
  const response = await getResults(sql);
  return response;
};

exports.deleteTable = async (table) => {
  const tableToDelete = table.title;
  const sql = `DROP TABLE ${tableToDelete}`;
  const response = await getResults(sql);
  return response;
};
