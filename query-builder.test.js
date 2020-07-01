const queryBuilder = require('./query-builder.js');
describe('query builder tests', () => {
  
  test('when a shape query is sent', () => {
    const query = JSON.stringify(filter={"shape":"ttype"});
    expect(queryBuilder(query)).toEqual({"shape":"ttype"});
  });
  
  test('when a shape and colour query is sent', () => {
    const query = JSON.stringify(filter={"shape":"ttype", "colour": ["purple", "red"]});
    expect(queryBuilder(query)).toEqual({"shape":"ttype", "colour": {$in: ["purple", "red"]}});
  });
});