const qb = require('./query-builder')

exports.query = function(res, db) {
  const queryString = qb.buildQuery();
  db.query(queryString, (err, result) => { 
     if (err) throw err;
     const response = {result, queryString};
     console.log(response)
     res.send(response);
  });
  qb.resetQueryValues();
}

exports.retrieve = async function(db) {
  let queryString = qb.buildQuery();
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
  qb.resetQueryValues();
  await getResults();
  const response = {array, queryString};
  return response;
}