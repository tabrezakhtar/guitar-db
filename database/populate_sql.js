const sqlite3 = require("sqlite3").verbose();

const dbName = "guitar-db.sqlite";
const tableName = "guitars";

const guitars = [
  {
    brand: "fender",
    shape: "stratocaster",
    name: "american professional ii",
    series: "professional",
    pickups: "single-coil",
    trem: "2-point synchronized tremolo",
    frets: 22,
    tuners: "standard cast/sealed",
    colour: "yellow",
    fretboard: "maple",
    description: "A versatile guitar with a classic design.",
  },
  {
    brand: "fender",
    shape: "telecaster",
    name: "american ultra",
    series: "ultra",
    pickups: "single-coil",
    trem: "none",
    frets: 22,
    tuners: "deluxe cast/sealed",
    colour: "yellow",
    fretboard: "rosewood",
    description: "A modern take on the classic Telecaster.",
  },
  {
    brand: "fender",
    shape: "jaguar",
    name: "player",
    series: "player",
    pickups: "humbucker",
    trem: "floating tremolo",
    frets: 22,
    tuners: "standard cast/sealed",
    colour: "black",
    fretboard: "pau ferro",
    description: "A versatile guitar with a unique design.",
  },
  {
    brand: "fender",
    shape: "mustang",
    name: "american performer",
    series: "performer",
    pickups: "single-coil",
    trem: "dynamic vibrato",
    frets: 22,
    tuners: "classic gear",
    colour: "purple",
    fretboard: "maple",
    description: "A short-scale guitar with a distinctive sound.",
  },
  {
    brand: "fender",
    shape: "jazzmaster",
    name: "american original",
    series: "original",
    pickups: "single-coil",
    trem: "floating tremolo",
    frets: 21,
    tuners: "vintage-style",
    colour: "white",
    fretboard: "rosewood",
    description: "A classic guitar with a rich history.",
  },
  {
    brand: "fender",
    shape: "stratocaster",
    name: "player",
    series: "player",
    pickups: "single-coil",
    trem: "2-point synchronized tremolo",
    frets: 22,
    tuners: "standard cast/sealed",
    colour: "white",
    fretboard: "maple",
    description: "A versatile guitar with a classic design.",
  },
  {
    brand: "fender",
    shape: "telecaster",
    name: "american professional ii",
    series: "professional",
    pickups: "single-coil",
    trem: "none",
    frets: 22,
    tuners: "standard cast/sealed",
    colour: "blue",
    fretboard: "maple",
    description: "A modern take on the classic Telecaster.",
  },
  {
    brand: "fender",
    shape: "jaguar",
    name: "american performer",
    series: "performer",
    pickups: "humbucker",
    trem: "floating tremolo",
    frets: 22,
    tuners: "classic gear",
    colour: "blue",
    fretboard: "rosewood",
    description: "A versatile guitar with a unique design.",
  },
  {
    brand: "fender",
    shape: "mustang",
    name: "player",
    series: "player",
    pickups: "single-coil",
    trem: "dynamic vibrato",
    frets: 22,
    tuners: "standard cast/sealed",
    colour: "yellow",
    fretboard: "pau ferro",
    description: "A short-scale guitar with a distinctive sound.",
  },
  {
    brand: "fender",
    shape: "jazzmaster",
    name: "american ultra",
    series: "ultra",
    pickups: "single-coil",
    trem: "floating tremolo",
    frets: 21,
    tuners: "deluxe cast/sealed",
    colour: "black",
    fretboard: "rosewood",
    description: "A classic guitar with a rich history.",
  },
  {
    brand: "gibson",
    shape: "les paul",
    name: "standard 50s",
    series: "standard",
    pickups: "humbucker",
    trem: "none",
    frets: 22,
    tuners: "vintage deluxe",
    colour: "red",
    fretboard: "rosewood",
    description: "A classic guitar with a powerful sound.",
  },
  {
    brand: "gibson",
    shape: "sg",
    name: "standard",
    series: "standard",
    pickups: "humbucker",
    trem: "none",
    frets: 22,
    tuners: "vintage deluxe",
    colour: "red",
    fretboard: "rosewood",
    description: "A lightweight guitar with a fast neck.",
  },
  {
    brand: "gibson",
    shape: "explorer",
    name: "original",
    series: "original",
    pickups: "humbucker",
    trem: "none",
    frets: 22,
    tuners: "grover mini rotomatics",
    colour: "yellow",
    fretboard: "rosewood",
    description: "A futuristic guitar with a bold design.",
  },
  {
    brand: "gibson",
    shape: "flying v",
    name: "original",
    series: "original",
    pickups: "humbucker",
    trem: "none",
    frets: 22,
    tuners: "grover mini rotomatics",
    colour: "white",
    fretboard: "rosewood",
    description: "A radical guitar with a distinctive look.",
  },
  {
    brand: "gibson",
    shape: "firebird",
    name: "original",
    series: "original",
    pickups: "mini-humbucker",
    trem: "none",
    frets: 22,
    tuners: "grover mini rotomatics",
    colour: "yellow",
    fretboard: "rosewood",
    description: "A unique guitar with a reverse body design.",
  },
  {
    brand: "gibson",
    shape: "les paul",
    name: "standard 60s",
    series: "standard",
    pickups: "humbucker",
    trem: "none",
    frets: 22,
    tuners: "vintage deluxe",
    colour: "yellow",
    fretboard: "rosewood",
    description: "A classic guitar with a powerful sound.",
  },
  {
    brand: "gibson",
    shape: "sg",
    name: "special",
    series: "special",
    pickups: "p-90",
    trem: "none",
    frets: 22,
    tuners: "vintage deluxe",
    colour: "blue",
    fretboard: "rosewood",
    description: "A lightweight guitar with a fast neck.",
  },
  {
    brand: "gibson",
    shape: "explorer",
    name: "custom",
    series: "custom",
    pickups: "humbucker",
    trem: "none",
    frets: 22,
    tuners: "grover mini rotomatics",
    colour: "black",
    fretboard: "ebony",
    description: "A futuristic guitar with a bold design.",
  },
  {
    brand: "gibson",
    shape: "flying v",
    name: "custom",
    series: "custom",
    pickups: "humbucker",
    trem: "none",
    frets: 22,
    tuners: "grover mini rotomatics",
    colour: "black",
    fretboard: "ebony",
    description: "A radical guitar with a distinctive look.",
  },
  {
    brand: "gibson",
    shape: "firebird",
    name: "custom",
    series: "custom",
    pickups: "mini-humbucker",
    trem: "none",
    frets: 22,
    tuners: "grover mini rotomatics",
    colour: "black",
    fretboard: "ebony",
    description: "A unique guitar with a reverse body design.",
  },
  {
    brand: "ibanez",
    shape: "rg",
    name: "rg550",
    series: "genesis collection",
    pickups: "humbucker",
    trem: "edge",
    frets: 24,
    tuners: "gotoh",
    colour: "red",
    fretboard: "maple",
    description: "A high-performance guitar with a fast neck.",
  },
  {
    brand: "ibanez",
    shape: "s",
    name: "s670qm",
    series: "standard",
    pickups: "humbucker",
    trem: "edge zero ii",
    frets: 24,
    tuners: "gotoh",
    colour: "yellow",
    fretboard: "rosewood",
    description: "A sleek guitar with a versatile sound.",
  },
  {
    brand: "ibanez",
    shape: "jem",
    name: "jemjr",
    series: "standard",
    pickups: "humbucker",
    trem: "double locking tremolo",
    frets: 24,
    tuners: "gotoh",
    colour: "white",
    fretboard: "rosewood",
    description: "A signature guitar with a unique design.",
  },
  {
    brand: "ibanez",
    shape: "rg",
    name: "rg421",
    series: "standard",
    pickups: "humbucker",
    trem: "none",
    frets: 24,
    tuners: "gotoh",
    colour: "brown",
    fretboard: "rosewood",
    description: "A high-performance guitar with a fast neck.",
  },
  {
    brand: "ibanez",
    shape: "s",
    name: "s520",
    series: "standard",
    pickups: "humbucker",
    trem: "edge zero ii",
    frets: 24,
    tuners: "gotoh",
    colour: "yellow",
    fretboard: "rosewood",
    description: "A sleek guitar with a versatile sound.",
  },
  {
    brand: "ibanez",
    shape: "jem",
    name: "jem7v",
    series: "signature",
    pickups: "humbucker",
    trem: "edge",
    frets: 24,
    tuners: "gotoh",
    colour: "white",
    fretboard: "ebony",
    description: "A signature guitar with a unique design.",
  },
  {
    brand: "ibanez",
    shape: "rg",
    name: "rg550dx",
    series: "genesis collection",
    pickups: "humbucker",
    trem: "edge",
    frets: 24,
    tuners: "gotoh",
    colour: "purple",
    fretboard: "maple",
    description: "A high-performance guitar with a fast neck.",
  },
  {
    brand: "ibanez",
    shape: "s",
    name: "s670ah",
    series: "standard",
    pickups: "humbucker",
    trem: "edge zero ii",
    frets: 24,
    tuners: "gotoh",
    colour: "yellow",
    fretboard: "rosewood",
    description: "A sleek guitar with a versatile sound.",
  },
  {
    brand: "ibanez",
    shape: "jem",
    name: "jem77p",
    series: "premium",
    pickups: "humbucker",
    trem: "edge",
    frets: 24,
    tuners: "gotoh",
    colour: "blue",
    fretboard: "maple",
    description: "A signature guitar with a unique design.",
  },
  {
    brand: "ibanez",
    shape: "rg",
    name: "rg550",
    series: "genesis collection",
    pickups: "humbucker",
    trem: "edge",
    frets: 24,
    tuners: "gotoh",
    colour: "yellow",
    fretboard: "maple",
    description: "A high-performance guitar with a fast neck.",
  },
];

async function main() {
  const db = new sqlite3.Database(dbName, (err) => {
    if (err) {
      console.error("Error opening database:", err.message);
    } else {
      console.log("Connected to SQLite database");
    }
  });

  db.serialize(() => {
    // Drop the table if it exists
    db.run(`DROP TABLE IF EXISTS ${tableName}`, (err) => {
      if (err) {
        console.error("Error dropping table:", err.message);
      } else {
        console.log(`Table "${tableName}" dropped`);
      }
    });

    // Create the table with an auto-incrementing id field
    db.run(
      `CREATE TABLE ${tableName} (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        brand TEXT,
        shape TEXT,
        name TEXT,
        series TEXT,
        pickups TEXT,
        trem TEXT,
        frets INTEGER,
        tuners TEXT,
        colour TEXT,
        fretboard TEXT,
        description TEXT
      )`,
      (err) => {
        if (err) {
          console.error("Error creating table:", err.message);
        } else {
          console.log(`Table "${tableName}" created`);
        }
      }
    );

    // Insert the data
    const insertStmt = db.prepare(
      `INSERT INTO ${tableName} (brand, shape, name, series, pickups, trem, frets, tuners, colour, fretboard, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    guitars.forEach((guitar) => {
      insertStmt.run(
        guitar.brand,
        guitar.shape,
        guitar.name,
        guitar.series,
        guitar.pickups,
        guitar.trem,
        guitar.frets,
        guitar.tuners,
        guitar.colour,
        guitar.fretboard,
        guitar.description,
        (err) => {
          if (err) {
            console.error("Error inserting data:", err.message);
          }
        }
      );
    });

    insertStmt.finalize((err) => {
      if (err) {
        console.error("Error finalizing statement:", err.message);
      } else {
        console.log("Data inserted into table");
      }
    });
  });

  db.close((err) => {
    if (err) {
      console.error("Error closing database:", err.message);
    } else {
      console.log("Connection to SQLite database closed");
    }
  });
}

main();