const mysql = require('mysql2')

let db;
let dbTables = {};

exports.db = function(options) {
  db = mysql.createConnection(options);

  db.connect((err) => {
    console.log('db.connect')
    if (err) {
      console.log('error at line 10 database.js')
    }
    console.log('mysql up and running!');
  });

  db.query('SHOW TABLES', (err, databaseTables) => { 
    if (err) throw err;
    let len = databaseTables.length
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

exports.tables = function() {
  return dbTables
}
  
//GLOBAL VARIABLES/CONSTRUCTORS
queryString = ''
//query string variables
selected = []
let valsSelectedAs = ''
let joins = ''
let filters = ''
let orders = ''
let groupings = ''
//reference variables
let object = {}
let joinObject = {}
let mappedObjects = []
let tableTitle = ''
let aggregates = []
//deprecated variables
// functionString = ''
let queryValues = {
  tableTitle: '',
  selected: [],
  filters: '',
  functions: [],
  limit: ''
}


exports.get = (selectedTable) => {
  // console.log(selectedTable)
  // object = selectedTable
  queryValues.tableTitle = `${selectedTable.title}`
  // filters = ''
  // orders = ''
  // aggregates = [] //*1
  // selected = [] 
  // this.mappedObjects = []
  // mappedObjects.push(selectedTable)
  return this
}

//BASIC QUERIES
exports.select = (fields) => {
  let selectedFields;
  if (queryValues.functions.length > 0) {
    console.log(queryValues.functions)
    selectedFields = queryValues.functions;
    if (selectedFields.length > 1) {
      selectedFields = selectedFields.map(fld => fld).join(', ')
    }
    queryValues.functions = [];
  } else if (Array.isArray(fields)) {
    selectedFields = fields.map(fld => fld).join(', ')
  } else {
    selectedFields = `*`
  }
  queryValues.selected.push(`${selectedFields}`);
  console.log(selectedFields)
  return this;
}

exports.selectAs = (selected) => {
 let aliases = sanitiseArray(selected);
 let aliasArray = [];
 aliases.forEach(alias => {
   const aliasToPush = stringifyKeys(alias);
   aliasArray.push(` AS '${aliasToPush}'`)
 });
 for (let i = 0; i < aliasArray.length; i++) {
   aliasArray[i] = `${queryValues.functions[i]}${aliasArray[i]}`
 };
 let aliasQueries = aliasArray.join(', ');
 queryValues.selected.push(aliasQueries);
 queryValues.functions = [];
 return this
}

exports.join = (table, conditions) => {
  mapObject(table)
  let mainTableValue = `${this.object.title}.${conditions[0]}`
  let joinTableValue = `${table.title}.${conditions[1]}`
  let mainTableValueExists = checkValueInDb(mainTableValue)
  let joinTableValueExists = checkValueInDb(joinTableValue)
  if (mainTableValueExists && joinTableValueExists > -1) {
    this.joins = ` JOIN ${table.title} ON ${mainTableValue} = ${joinTableValue}`
    return this
  } else {
    console.log('value does not exist in database')
  } 
}

exports.filter = (selectedObjectArray) => {
  const selected = objectify(selectedObjectArray);
  for (let i = 0; i < selected.length; i++) {
    if (i === 0) {
      queryValues.filters += ` WHERE ${selected[i].field} = '${selected[i].value}'`
    } else {
      queryValues.filters += ` AND ${selected[i].field} = '${selected[i].value}'`
    }
  };
  return this;
}

exports.sort = (selectedObject) => {
  const object = objectify(selectedObject);
  const field = object.field
  let direction;
  if (object.value == 1) {
    direction = 'ASC';
  } else if (object.value == -1){
    direction = 'DESC';
  }
  this.orders = ` ORDER BY ${field} ${direction}`
  return this;
};

exports.groupBy = (selected) => {
  this.groupings = ` GROUP BY ${selected}`
  return this
}

exports.limit = (num) => {
  queryValues.limit = ` LIMIT ${num}`
  return this
}


//AGGREGATE FUNCTIONS
exports.concat = (...args) => {
  let arr = [...args];
  let concat = `CONCAT(${arr.map(x => x).join()})`;
  queryValues.functions.push(concat);
}

exports.rename = (name) => {
  let keyValuePair = getKeyValuePair(name);
  queryValues.functions.push(keyValuePair);
}

exports.sum = (str) => {
  console.log('sum')
  queryValues.functions.push(`SUM(${str})`)
}

exports.avg = (str) => {
  queryValues.functions.push(`AVG(${str})`)
}

exports.count = (str) => {
  console.log(str)
  queryValues.functions.push(`COUNT(${str})`)
}





//LOCAL FUNCTIONS
function objectify(selected) {
  return Array.isArray(selected) ?
  objectifyArray(selected):
  objectifyObjectMap(selected)
}

function objectifyObjectMap(selectedObject) {
  const selected = {};
    for (const [key, name] of Object.entries(selectedObject)) {
      selected.field = `${key}`;
      selected.value = `${name}`;
    };
  return selected
}

function objectifyArray(selectedObjectArray) {
  const selected = [];
  selectedObjectArray.forEach(selectedObject => {
    for (const [key, name] of Object.entries(selectedObject)) {
      let field = `${key}`;
      let value = `${name}`;
      selected.push({field: field, value: value});
    };
  });
  return selected
}

function stringifyKeys(object) {
  for (key in object) {
    return `${key}`
  };
}

function mapObject(selectedTable) {
  mappedObjects.push(selectedTable)
}

function getKeyValuePair(value) {
  if (Array.isArray(value)) {
    for (let i = 0; i < dbTables.length; i++) {
      let keyValuePair = `${dbTables[i].title}.${value}`
      if (Object.values(dbTables[i]).indexOf(keyValuePair) > -1) {
        console.log(keyValuePair)
        return keyValuePair
      };
    };
  };

  for (const table in dbTables) {
    let keyValuePair = `${dbTables[table].title}.${value}`;
    if (Object.values(dbTables[table]).indexOf(keyValuePair) > -1) {
      return keyValuePair
    }
  }
}

function checkValueInDb(value) {
 let booleans = []
 for (let i = 0; i < this.mappedObjects.length; i++) {
   if (Object.values(this.mappedObjects[i]).indexOf(value) > -1) {
     booleans.push(true)
   } else {
     booleans.push(false)
   }
 }
 return booleans.includes(true)
}

function buildQuery() {
  let selected = queryValues.selected.join(', ')
  if (!queryValues.joins) {
    queryValues.joins = '';
  };
  if (!queryValues.filters) {
    queryValues.filters = '';
  };
  if (!queryValues.orders) {
    queryValues.orders = ''
  };
  if (!queryValues.groupings) {
   queryValues.groupings = ''
  };
  if (!queryValues.limit) {
    queryValues.limit = ''
   };
  const queryString = `SELECT ${selected} FROM ${queryValues.tableTitle}${queryValues.joins}${queryValues.filters}${queryValues.orders}${queryValues.groupings}${queryValues.limit}`;
  return queryString;
}

function sanitiseArray(selected) {
  if (!Array.isArray(selected)) {
    return [selected];
  } else {
    return selected;
  }
}

//DB QUERY
exports.query = function(res) {
  let queryString = buildQuery()
  console.log(queryString)
  db.query(queryString, (err, result) => { 
     if (err) throw err;
     res.send(result);
  });
  queryValues = {
    tableTitle: '',
    selected: [],
    filters: '',
    functions: [],
    limit: ''
  };
}


exports.retrieve = async function() {
  let queryString = buildQuery();
  console.log(queryString);
  let array = [];

  function getResults() {
    return new Promise((resolve, reject) => {
      db.query(queryString, (err, results) => { 
        if (err) throw reject(err);
        results.forEach(result => {
          let object = {}
          for (const [key, value] of Object.entries(result)) {
            object[key] = `${value}`
          };
          array.push(object)
        });
        resolve(results)
      });
    });
  };
  
  queryValues = {
    tableTitle: '',
    selected: [],
    filters: '',
    functions: [],
  };

  await getResults()
  
  return array
}







// exports.createTables = function() {
//   return createTables;
// };

// exports.createQuery = function() {
//   return createQuery;
// }

//BIG FILTER FUNCTION
//where equals
//where not !equals
//where in
//where !in
//where greater than
//where less than
//where greaterEquals
//where less equals 


// exports.filterComplex = (selectedObjectArray) => {
//   function inner(x) {
//     console.log(x)
//   }
//   const filters = [
//     {
//       clauses: {
//         'where': ' WHERE',
//         'not': ' WHERE NOT'
//       }
//     },
//     {
//       conjunctions: {
//         'and': 'AND',
//         'or': 'OR'
//       } 
//     },
//     {
//       operators: {
//         'equal': '=',
//         'notEqual': '<>',
//         'in': 'IN',
//         'notIn': 'NOT IN',
//         'gtn': '>',
//         'gtnEqual': '>=',
//         'lst': '<',
//         'lstEqual': '<='
//       }
//     }
//   ]
//   const stuff = {
//     clauses: {
//       'where': ' WHERE',
//       'not': ' WHERE NOT'
//     },
//     conjunctions: {
//       'and': 'AND',
//       'or': 'OR'
//     },
//     operators: {
//       'equal': '=',
//       'notEqual': '<>',
//       'in': 'IN',
//       'notIn': 'NOT IN',
//       'gtn': '>',
//       'gtnEqual': '>=',
//       'lst': '<',
//       'lstEqual': '<='
//     }
//   }
  // console.log(objectArray[0])
  // const selected = objectify(selectedObjectArray);
  // for (let i = 0; i < selected.length; i++) {
  //   if (i === 0) {
  //     queryValues.filters += ` ${clauses} ${selected[i].field} = '${selected[i].value}'`
  //   } else {
  //     queryValues.filters += ` ${conjunction} ${selected[i].field} = '${selected[i].value}'`
  //   }
  // };
//   return this;
// }
let conditions = [];
let conjunctions = [];
exports.filterComplex = {
  like(x) {
    const selected = objectify(x);
    const condition = `${selected.field} LIKE '${selected.value}'`
    conditions.push(condition)
    return this
  },
  equal(cndtn) {
    const selected = objectify(cndtn);
    const condition = `${selected.field} = ${selected.value}`;
    conditions.push(condition);
    return this
  },
  notEqual(cndtn) {
    const selected = objectify(cndtn);
    const condition = `${selected.field} <> ${selected.value}`;
    conditions.push(condition);
    return this
  },
  in(cndtn) {
    const selected = objectify(cndtn);
    const condition = `${selected.field} IN (${selected.value})`;
    conditions.push(condition);
    return this
  },
  notIn(cndtn) {
    const selected = objectify(cndtn);
    const condition = `NOT ${selected.field} IN ${selected.value}`;
    conditions.push(condition);
    return this
  },
  gtn(cndtn) {
    const selected = objectify(cndtn);
    const condition = `${selected.field} > ${selected.value}`;
    conditions.push(condition);
    return this
  },
  gtnEqual(cndtn) {
    const selected = objectify(cndtn);
    const condition = `${selected.field} >= ${selected.value}`;
    conditions.push(condition);
    return this
  },
  lst(cndtn) {
    const selected = objectify(cndtn);
    const condition = `${selected.field} < ${selected.value}`;
    conditions.push(condition);
    return this
  },
  lstEqual(cndtn) {
    const selected = objectify(cndtn);
    const condition = `${selected.field} <= ${selected.value}`;
    conditions.push(condition);
    return this
  },
  between(cndtn) {
    const selected = objectify(cndtn);
    let selectedValueArray = selected.value.split(',')
    const condition = `${selected.field} BETWEEN ${selectedValueArray[0]} AND ${selectedValueArray[1]}`;
    conditions.push(condition);
    console.log(conditions)
    return this
  },

  or() {
    const conjunction = 'OR';
    conjunctions.push(conjunction)
    console.log(conjunctions)
    return this
  },
  and() {
    const conjunction = 'AND';
    conjunctions.push(conjunction)
    // console.log(conjunctions)
    return this
  },

  set() {
    console.log(conditions)
    console.log(conjunctions)
    let filterQuery;
    for (let i = 0; i < conditions.length; i++) {
      if (i === 0) {
        filterQuery = ` WHERE ${conditions[0]}`
      } else {
        filterQuery += ` ${conjunctions[i -1]} ${conditions[i]}`
      }
    };
    console.log(filterQuery)
  return filterQuery;
  }
}

exports.where = (filterQuery) => {
  queryValues.filters = filterQuery;
  return this
}