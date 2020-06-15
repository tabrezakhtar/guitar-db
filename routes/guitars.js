const express = require('express')
const router = express.Router()
const Guitar = require('../models/guitar')
const queryBuilder = require('../query-builder.js');

router.get('/', async (req, res) => {
  try {
    const guitars = await Guitar.find();
    const settings = await Guitar.aggregate(
      [
        {
          $group:
            {
              _id: 1,
              brand: { $addToSet: "$brand" },
              colours: { $addToSet: "$colour" },
              pickups: { $addToSet: "$pickups" },
              tremolo: { $addToSet: "$tremolo" },
              fretboard: { $addToSet: "$fretboard" }
            }
        }
      ]
   )

    res.status(200).send({ guitars, settings });
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

router.get('/filterBy', async (req, res) => {
  let filter = {};

  if (req.query.filter) {
    filter = queryBuilder(decodeURI(req.query.filter));
  }

  try {
    const guitar = await Guitar.find(filter);
    res.json(guitar)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
});

router.post('/', async (req, res) => {
  const guitar = new Guitar({
    brand: 'squier'
  })

  try {
    const newGuitar = await guitar.save()
    res.status(201).json(newGuitar)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
})

module.exports = router;
