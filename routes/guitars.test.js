// const mockingoose = require('mockingoose').default;
// const GuitarModel = require('../models/guitar');
// const GuitarRoute = require('./guitars');

// beforeEach(() => {

// });

// afterEach( () => {

// });

// it('Testing to see if jest works', () => {
//   expect(2).toBe(2)
// });

// it('should return a list of guitars', (done) => {
//     const guitars = {
//       "guitars": [
//         {
//           "_id": "5ec800ded9841bfce65c3a3a",
//           "brand": "fender",
//           "shape": "stype",
//           "name": "stratocaster"
//         },
//         {
//           "_id": "5ec80125d9841bfce65c4c6d",
//           "brand": "fender",
//           "shape": "ttype",
//           "name": "telecaster"
//         }
//       ]
//     }

//     mockingoose(GuitarModel).toReturn(guitars, 'find');

//     const settings = {
//       "some": "settings"
//     }

//     mockingoose(GuitarModel).toReturn(settings, 'aggregate');

//     expect(2).toBe(2);
//     done();
// });