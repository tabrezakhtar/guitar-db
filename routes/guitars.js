const db = require("../database/db_connect");

function queryBuilder(params) {
  const query = JSON.parse(params);
  const queryKeys = Object.keys(query);
  let sqlQuery = "WHERE ";
  let queryValues = [];

  for (const key of queryKeys) {
    if (Array.isArray(query[key])) {
      sqlQuery += `${key} IN (${query[key].map(() => "?").join(", ")}) AND `;
      queryValues.push(...query[key]);
    } else {
      sqlQuery += `${key} = ? AND `;
      queryValues.push(query[key]);
    }
  }

  // Remove the trailing " AND "
  sqlQuery = sqlQuery.slice(0, -5);

  return { sqlQuery, queryValues };
}

async function getSettings() {
  const settings = {
    brand: [],
    colours: [],
    pickups: [],
    tremolo: [],
    fretboard: []
  };

  try {
    const brands = await new Promise((resolve, reject) => {
      db.all("SELECT DISTINCT brand FROM guitars", [], (err, rows) => {
        resolve(rows.map(row => row.brand));
      });
    });
    settings.brand = brands;

    const colours = await new Promise((resolve, reject) => {
      db.all("SELECT DISTINCT colour FROM guitars", [], (err, rows) => {
        resolve(rows.map(row => row.colour));
      });
    });
    settings.colours = colours;

    const pickups = await new Promise((resolve, reject) => {
      db.all("SELECT DISTINCT pickups FROM guitars", [], (err, rows) => {
        resolve(rows.map(row => row.pickups));
      });
    });
    settings.pickups = pickups;

    const tremolos = await new Promise((resolve, reject) => {
      db.all("SELECT DISTINCT trem FROM guitars", [], (err, rows) => {
        resolve(rows.map(row => row.trem));
      });
    });
    settings.tremolo = tremolos;

    const fretboards = await new Promise((resolve, reject) => {
      db.all("SELECT DISTINCT fretboard FROM guitars", [], (err, rows) => {
        resolve(rows.map(row => row.fretboard));
      });
    });
    settings.fretboard = fretboards;
    return settings;
  } catch (err) {
    throw err;
  }
}

async function get(req, res) {
  db.all("SELECT * FROM guitars", [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
}

async function filter(req, res) {
  let sqlQuery = "";
  let queryValues = [];

  if (req.query.filter) {
    const query = queryBuilder(decodeURI(req.query.filter));
    sqlQuery = query.sqlQuery;
    queryValues = query.queryValues;
  }

  const query = `SELECT * FROM guitars ${sqlQuery}`;
  db.all(query, queryValues, async (err, rows) => {
    if (err) {
      res.status(500).json({ message: err.message });
    } else {
      try {
        const settings = await getSettings();
        res.status(200).send({ guitars: rows, settings });
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  });
}

async function create(req, res) {
  const { brand, colour, pickups, tremolo, fretboard } = req.body;

  const query = `
    INSERT INTO guitars (brand, colour, pickups, tremolo, fretboard)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [brand, colour, pickups, tremolo, fretboard];

  db.run(query, values, function (err) {
    if (err) {
      res.status(400).json({ message: err.message });
    } else {
      res.status(201).json({ id: this.lastID, ...req.body });
    }
  });
}

async function update(req, res) {
  const { brand, colour, pickups, tremolo, fretboard } = req.body;

  const query = `
    UPDATE guitars
    SET brand = ?, colour = ?, pickups = ?, tremolo = ?, fretboard = ?
    WHERE id = ?
  `;
  const values = [brand, colour, pickups, tremolo, fretboard, req.params.id];

  db.run(query, values, function (err) {
    if (err) {
      res.status(400).json({ message: err.message });
    } else if (this.changes === 0) {
      res.status(404).json({ message: "Guitar not found" });
    } else {
      res.status(200).json({ id: req.params.id, ...req.body });
    }
  });
}

module.exports = { get, filter, create, update };