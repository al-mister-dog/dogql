exports.createWhereQueries = (selectedObjectArray) => {
  let filters = ''
  const selected = objectifyFilter(selectedObjectArray);
  console.log(selected.length)
  for (let i = 0; i < selected.length; i++) {
    if (i === 0) {
      filters += ` WHERE ${selected[i].field} = '${selected[i].value}'`
    } else {
      filters += ` AND ${selected[i].field} = '${selected[i].value}'`
    }
  };
  return filters
}

exports.objectify = (selected) => {
  return Array.isArray(selected) ?
  objectifyArray(selected):
  objectifyObjectMap(selected)
}

exports.objectifySort = (selected)  => {
  return Array.isArray(selected) ?
  objectifyArray(selected):
  objectifyObjectMap(selected)
}

function objectifyFilter(selected) {
  return Array.isArray(selected) ?
  objectifyArray(selected):
  objectifyArray([selected])
}

function objectifyObjectMap(selectedObject) {
  console.log('objectifyObjectMap')
  const selected = {};
    for (const [key, name] of Object.entries(selectedObject)) {
      selected.field = `${key}`;
      selected.value = `${name}`;
    };
    console.log(selected)
  return selected
}

function objectifyArray(selectedObjectArray) {
  console.log('objectifyArray')
  const selected = [];
  selectedObjectArray.forEach(selectedObject => {
    for (const [key, name] of Object.entries(selectedObject)) {
      let field = `${key}`;
      let value = `${name}`;
      selected.push({field: field, value: value});
    };
  });
  return selected
};

exports.sanitiseArray = (selected) => {
  if (!Array.isArray(selected)) {
    return [selected];
  } else {
    return selected;
  }
}

exports.stringifyKeys = (object) => {
  for (key in object) {
    return `${key}`
  };
}

exports.checkValueInDb = (value, mappedObjects) => {
  let booleans = []
  for (let i = 0; i < mappedObjects.length; i++) {
    if (Object.values(mappedObjects[i]).indexOf(value) > -1) {
      booleans.push(true)
    } else {
      booleans.push(false)
    }
  }
  return booleans.includes(true)
}

exports.getKeyValuePair = (value, dbTables) => {
  if (Array.isArray(value)) {
    for (let i = 0; i < dbTables.length; i++) {
      let keyValuePair = `${dbTables[i].title}.${value}`
      if (Object.values(dbTables[i]).indexOf(keyValuePair) > -1) {
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



exports.createSetQueries = (object) => {
  let sets = []
  for (const [key, value] of Object.entries(object)) {
    sets.push(`${key} = '${value}'`)
  }
  return sets
}