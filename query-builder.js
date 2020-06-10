function queryBuilder(params) {
  const query = JSON.parse(params);
  const queryKeys = Object.keys(query);
  let mongoQuery = {};

  for (const key of queryKeys) {
    if (Array.isArray(query[key])) {
      mongoQuery[key] = {'$in': query[key]}
    } else {
      mongoQuery[key] = query[key];
    }
  }

  console.log(mongoQuery);
}

module.exports = queryBuilder;
