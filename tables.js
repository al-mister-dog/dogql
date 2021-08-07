// function getResults() {
//   return new Promise((resolve, reject) => {
//     db.query(queryString, (err, results) => { 
//       if (err) throw reject(err);
//       results.forEach(result => {
//         let object = {}
//         for (const [key, value] of Object.entries(result)) {
//           object[key] = `${value}`
//         };
//         array.push(object)
//       });
//       resolve(results)
//     });
//   });
// };
const mysql = require('mysql2')

// const options = {
// host:'localhost',
// user:'root',
// password:'Coltrane67',
// database: 'test_db',
// }

let db;
let dbTables = {};
exports.db = function (options) {
  return new Promise((resolve, reject) => {
    
    db = mysql.createConnection(options);
  
    db.connect((err) => {
      if (err) {
        console.log("error at line 10 database.js");
      }
      console.log("mysql up and running!");
    });

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
        const tables = dbTables;
        resolve(tables);
      }
    });
  
  
  
  })
};