exports.createTable = (object, db) => {
  init(db);
  createNewMySqlTable(object, db);
  addInsertQueryToDogTable(object, db);
  const newObject = createTableObject(object);
  return newObject;
};

function init(db) {
  return db.execute(`CREATE TABLE IF NOT EXISTS dog_tables (name VARCHAR(255) UNIQUE NOT NULL, query TEXT(1000) NOT NULL);`);
}

//column name/ data type
function createNewMySqlTable(object, db) {
  let tableName = `CREATE TABLE IF NOT EXISTS ${object.title}`;
  let fieldDefinitions = [];
  for (const [key, value] of Object.entries(object.fields)) {
    fieldDefinitions.push(`${key} ${value}`);
  };
  let tableFields = fieldDefinitions.join(', ');
  const table = `${tableName} (${tableFields})`;
  
  return  db.execute(table)
}

function addInsertQueryToDogTable(object, db) {
  const tableName = `${object.title}`
  let fields = [];
  let escapes = [];
  for (const [key, value] of Object.entries(object.fields)) {
    if (value === 'INT NOT NULL PRIMARY KEY AUTO_INCREMENT') {
      continue
    } else {
      fields.push(`${key}`)
      escapes.push(`?`)
    }
  };
  fields = fields.join();
  const queryToInsert = `INSERT INTO ${tableName} (${fields}) VALUES(${escapes})`
  return db.execute(`INSERT INTO dog_tables (name, query) VALUES('${tableName}', '${queryToInsert}') ON DUPLICATE KEY UPDATE NAME = '${tableName}', QUERY = '${queryToInsert}'`)
}

function createTableObject (object) {
  let newObject = {
    title: object.title
  };
  for (key in object.fields) {
    newObject[key] = key
    newObject[key + 'KeyVal'] = `${object.title}.${key}`
  };
  return newObject
}

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





