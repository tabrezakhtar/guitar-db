const GuitarModel = require('../models/guitar');
const sinon = require('sinon');
const mocks = require('node-mocks-http');

const guitarRoute = require('./guitars');

const guitars = [
  {
    "_id": "5ec800ded9841bfce65c3a3a",
    "brand": "fender",
    "shape": "stype",
    "name": "stratocaster"
  },
  {
    "_id": "5ec80125d9841bfce65c4c6d",
    "brand": "fender",
    "shape": "ttype",
    "name": "telecaster"
  }
];

beforeEach(() => {

});

afterEach( () => {
  sinon.restore();
});

it('Testing to see if jest works', () => {
  expect(2).toBe(2)
});

it('get a list of guitars', async (done) => {
  sinon.mock(GuitarModel).expects('find').resolves(guitars);
  
  const settings = [{
    "some": "settings"
  }]

  sinon.mock(GuitarModel).expects('aggregate').returns(settings);
  
  const req = mocks.createRequest();
  const res = mocks.createResponse();

  await guitarRoute.getGuitars(req, res);

  expect(res._getData()).toEqual({guitars, settings: settings[0]});

  done();
});

it('get a list of guitars with a filter', async (done) => {
  const filterQuery = '{%22colour%22:[%22buttercream%22],%22brand%22:%22fender%22}';
  const filter = { colour: { '$in': [ 'buttercream' ] }, brand: 'fender' }
  const guitarMock = sinon.mock(GuitarModel).expects('find').resolves(guitars);
  
  const settings = [{
    "some": "settings"
  }]

  sinon.mock(GuitarModel).expects('aggregate').returns(settings);
  
  const req = mocks.createRequest({ query: { filter: filterQuery } });
  const res = mocks.createResponse();

  await guitarRoute.filterBy(req, res);

  expect(res._getData()).toEqual({guitars, settings: settings[0]});
  const result = guitarMock.getCall(0).args[0];
  expect(result).toEqual(filter);
  done();
});