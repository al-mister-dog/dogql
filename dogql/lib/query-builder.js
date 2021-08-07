const utils = require("./qb-utils");

let mappedObjects = [];

let queryValues = {
  tableTitle: "",
  selected: [],
  filters: "",
  functions: [],
  orders: "",
  joins: "",
  limit: "",
  groupings: "",
};

//SET TABLES: GET FOR MAIN TABLE, JOIN FOR JOIN TABLE
exports.get = (selectedTable) => {
  if (!selectedTable.title) {
    queryValues = { ...selectedTable };
    return this;
  }
  mapObject(selectedTable);
  queryValues.tableTitle = `${selectedTable.title}`;
  return this;
};

exports.join = (table, on) => {
  mapObject(table);
  const mainTableValue = `${queryValues.tableTitle}.${on.on[0]}`;
  const joinTableValue = `${table.title}.${on.on[1]}`;
  const mainTableValueExists = utils.checkValueInDb(
    mainTableValue,
    mappedObjects
  );
  const joinTableValueExists = utils.checkValueInDb(
    joinTableValue,
    mappedObjects
  );
  if (mainTableValueExists && joinTableValueExists > -1) {
    queryValues.joins = ` JOIN ${table.title} ON ${mainTableValue} = ${joinTableValue}`;
    return this;
  } else {
    console.log("value does not exist in database");
  }
};

function mapObject(selectedTable) {
  mappedObjects.push(selectedTable);
}

//QUERIES
exports.select = (fields) => {
  // console.log(fields);
  let selectedFields;
  // if fields are empty
  if (!Array.isArray(fields)) {
    selectedFields = `*`;
    queryValues.selected.push(`${selectedFields}`);
    return this;
  }

  let selectedFunctions;
  // if queryValues.functions contains values
  if (queryValues.functions.length > 0) {
    selectedFunctions = queryValues.functions;
    //if queryValues.functions has more than one value
    if (selectedFunctions.length > 1) {
      selectedFunctions = selectedFunctions.map((fld) => fld).join(", ");
    }
    queryValues.functions = [];
    queryValues.selected.push(`${selectedFunctions}`);
  }

  //if fields is an array
  if (Array.isArray(fields)) {
    const definedValues = fields.filter((field) => field !== undefined);
    //if array is now empty
    if (definedValues.length === 0) {
      return this;
    }
    selectedFields = definedValues.map((fld) => fld).join(", ");
    queryValues.selected.push(`${selectedFields}`);
    return this;
  }
};

exports.selectAs = (selected) => {
  // console.log(selected)
  let aliases = utils.sanitiseArray(selected);
  let aliasArray = [];
  aliases.forEach((alias) => {
    const aliasToPush = utils.stringifyKeys(alias);
    aliasArray.push(` AS '${aliasToPush}'`);
  });
  for (let i = 0; i < aliasArray.length; i++) {
    aliasArray[i] = `${queryValues.functions[i]}${aliasArray[i]}`;
  }
  let aliasQueries = aliasArray.join(", ");
  queryValues.selected.push(aliasQueries);
  queryValues.functions = [];
  return this;
};

exports.find = (selected) => {
  if (queryValues.filters !== "") {
    queryValues.filters = "";
  }
  const filters = utils.createWhereQueries(selected);
  queryValues.filters += filters;
  return this;
};

exports.tableFilter = (selected) => {
  if (queryValues.filters !== "") {
    queryValues.filters = "";
  }
  let filters = "";
  for (let i = 0; i < selected.length; i++) {
    if (i === 0) {
      filters += ` WHERE ${selected[i].field} = '${selected[i].value}'`;
    } else {
      filters += ` AND ${selected[i].field} = '${selected[i].value}'`;
    }
  }
  queryValues.filters += filters;
  return this;
};

exports.where = (selected) => {
  queryValues.filters += selected;
  return this;
};

exports.filterRaw = (selected) => {
  queryValues.filters += ` WHERE ${selected}`;
  return this;
};

exports.sort = (selectedObject) => {
  const selected = utils.objectifySort(selectedObject);
  const directions = { 1: "ASC", "-1": "DESC" };
  queryValues.orders = ` ORDER BY ${selected.field} ${
    directions[selected.value]
  }`;
  return this;
};

exports.groupBy = (selected) => {
  queryValues.groupings = ` GROUP BY ${selected}`;
  return this;
};

exports.limit = (num) => {
  queryValues.limit = ` LIMIT ${num}`;
  return this;
};

exports.rename = (name, dbTables) => {
  let keyValuePair = utils.getKeyValuePair(name, dbTables);
  queryValues.functions.push(keyValuePair);
};

exports.concat = (...args) => {
  let arr = [...args];
  let concat = `CONCAT(${arr.map((x) => x).join()})`;
  queryValues.functions.push(concat);
};

exports.sum = (str) => {
  queryValues.functions.push(`SUM(${str})`);
};

exports.avg = (str) => {
  queryValues.functions.push(`AVG(${str})`);
};

exports.count = (str) => {
  queryValues.functions.push(`COUNT(${str})`);
};

exports.string = (str) => {
  queryValues.functions.push(str);
};

exports.createSetQueries = (object) => {
  let sets = [];
  for (const [key, value] of Object.entries(object)) {
    sets.push(`${key} = '${value}'`);
  }
  return sets;
};

exports.buildQuery = () => {
  let selected = queryValues.selected.join(", ");
  const selectedValues = {
    tableTitle: queryValues.tableTitle || "",
    filters: queryValues.filters || "",
    functions: queryValues.functions || "",
    orders: queryValues.orders || "",
    joins: queryValues.joins || "",
    limit: queryValues.limit || "",
    groupings: queryValues.groupings || "",
  };
  const queryString = `SELECT ${selected} FROM ${selectedValues.tableTitle}${selectedValues.joins}${selectedValues.filters}${selectedValues.orders}${selectedValues.groupings}${selectedValues.limit}`;
  return queryString;
};

let conditions = [];
let conjunctions = [];
exports.filter = {
  like(cndtn) {
    const selected = utils.objectify(cndtn);
    const condition = `${selected.field} LIKE '${selected.value}'`;
    conditions.push(condition);
    return this;
  },
  equal(cndtn) {
    const selected = utils.objectify(cndtn);
    const condition = `${selected.field} = ${selected.value}`;
    conditions.push(condition);
    return this;
  },
  notEqual(cndtn) {
    const selected = utils.objectify(cndtn);
    const condition = `${selected.field} <> ${selected.value}`;
    conditions.push(condition);
    return this;
  },
  in(cndtn) {
    console.log(cndtn)
    const selected = utils.objectify(cndtn);
    console.log(cndtn)
    if (selected.value.includes(",")) {
      selected.value = selected.value
        .split(",")
        .map((val) => `'${val}'`)
        .join(",");
    } else {
      selected.value = `'${selected.value}'`;
    }
    const condition = `${selected.field} IN (${selected.value})`;
    conditions.push(condition);
    return this;
  },
  notIn(cndtn) {
    console.log(cndtn)
    const selected = utils.objectify(cndtn);
    if (selected.value.includes(",")) {
      selected.value = selected.value
        .split(",")
        .map((val) => `'${val}'`)
        .join(",");
    } else {
      selected.value = `'${selected.value}'`;
    }
    const condition = `${selected.field} NOT IN (${selected.value})`;
    conditions.push(condition);
    return this;
  },
  gtn(cndtn) {
    const selected = utils.objectify(cndtn);
    const condition = `${selected.field} > ${selected.value}`;
    conditions.push(condition);
    return this;
  },
  gtnEqual(cndtn) {
    const selected = utils.objectify(cndtn);
    const condition = `${selected.field} >= ${selected.value}`;
    conditions.push(condition);
    return this;
  },
  ltn(cndtn) {
    const selected = utils.objectify(cndtn);
    const condition = `${selected.field} < ${selected.value}`;
    conditions.push(condition);
    return this;
  },
  ltnEqual(cndtn) {
    const selected = utils.objectify(cndtn);
    const condition = `${selected.field} <= ${selected.value}`;
    conditions.push(condition);
    return this;
  },
  between(cndtn) {
    const selected = utils.objectify(cndtn);
    let selectedValueArray = selected.value.split(",");
    const condition = `${selected.field} BETWEEN ${selectedValueArray[0]} AND ${selectedValueArray[1]}`;
    conditions.push(condition);
    return this;
  },

  or() {
    const conjunction = "OR";
    conjunctions.push(conjunction);
    return this;
  },
  and() {
    const conjunction = "AND";
    conjunctions.push(conjunction);
    return this;
  },

  set() {
    let filterQuery;
    for (let i = 0; i < conditions.length; i++) {
      if (i === 0) {
        filterQuery = ` WHERE ${conditions[0]}`;
      } else {
        filterQuery += ` ${conjunctions[i - 1]} ${conditions[i]}`;
      }
    }
    conditions = [];
    conjunctions = [];
    return filterQuery;
  },
};

exports.resetQueryValues = () => {
  queryValues = {
    tableTitle: "",
    selected: [],
    filters: "",
    functions: [],
    joins: "",
    limit: "",
  };
};

exports.template = (object) => {
  const templateValues = {
    tableTitle: object.table || "",
    selected: object.fields || [],
    filters: object.filters || "",
    functions: object.functions || [],
    joins:
      ` JOIN ${object.joinTable} ON ${object.joinOn[0]} = ${object.joinOn[1]}` ||
      "",
    limit: object.limit || "",
  };
  return templateValues;
};

exports.nest = () => {
  let queryString = this.buildQuery() 
  return queryString;
}