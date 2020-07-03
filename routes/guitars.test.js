const GuitarModel = require('../models/guitar');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const guitarRoute = require('./index');

let app = express()
app.use('/api/guitars', guitarRoute);

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
  sinon.stub(GuitarModel,'find');
});

afterEach( () => {
  GuitarModel.find.restore();
});

it('Testing to see if jest works', () => {
  expect(2).toBe(2)
});

it('should return a list of guitars', (done) => {
    GuitarModel.find.resolves(guitars);

    const settings = [{
      "some": "settings"
    }]

    sinon.mock(GuitarModel).expects('aggregate').returns(settings);

    request(app)
      .get('/api/guitars')
      .expect(function (res) {
        expect(res.body.guitars).toEqual(guitars);
        expect(res.body.settings).toEqual({ some: 'settings' });
      })
      .expect(200, done);
});