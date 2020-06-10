function queryBuilder(params) {
  const query = JSON.parse(params);
  console.log('1');
  const queryKeys = Object.keys(query);
  let mongoQuery = {};

  for (const key of queryKeys) {
    if (Array.isArray(query[key])) {
      mongoQuery[key] = {'$in': query[key]}
    } else {
      mongoQuery[key] = query[key];
    }
  }

  return mongoQuery;
}

module.exports = queryBuilder;
