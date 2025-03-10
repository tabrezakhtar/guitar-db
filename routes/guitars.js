const Guitar = require('../models/guitar')
// const {queryBuilder} = require('../query-builder.js');

// async function getSettings() {
//   const settings = await Guitar.aggregate(
//     [
//       {
//         $group:
//           {
//             _id: 1,
//             brand: { $addToSet: "$brand" },
//             colours: { $addToSet: "$colour" },
//             pickups: { $addToSet: "$pickups" },
//             tremolo: { $addToSet: "$tremolo" },
//             fretboard: { $addToSet: "$fretboard" }
//           }
//       }
//     ]
//  )

//  return settings[0];
// }

async function getGuitars(req, res) {
  try {
    const guitars = await Guitar.find();
    // const settings = await getSettings();
    res.status(200).send({ guitars });
  } catch (err) {
    res.status(500).json({ message: err })
  }
}

// async function filterBy(req, res) {
//   let filter = {};

//   if (req.query.filter) {
//     filter = queryBuilder(decodeURI(req.query.filter));
//   }

//   try {
//     const guitars = await Guitar.find(filter);
//     const settings = await getSettings();
//     res.status(200).send({ guitars, settings });
//   } catch (err) {
//     res.status(500).json({ message: err.message })
//   }
// }

// // router.post('/', async (req, res) => {
// //   const guitar = new Guitar({
// //     brand: 'squier'
// //   })

// //   try {
// //     const newGuitar = await guitar.save()
// //     res.status(201).json(newGuitar)
// //   } catch (err) {
// //     res.status(400).json({ message: err.message })
// //   }
// // })

// // module.exports = router;

module.exports = {getGuitars};