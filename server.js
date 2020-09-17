const express = require('express')
const app = express();
const path = require('path');
const compression = require('compression');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose')
const { graphqlHTTP } = require('express-graphql')
const { buildSchema } = require('graphql')

const Guitar = require('./models/guitar')

console.log('process.env.NODE_ENV', process.env.NODE_ENV)
let uri = '';
if (process.env.NODE_ENV === 'production') {
  uri = process.env.DATABASE_URI;
} else {
  uri = require('./config.json').connectionString;
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to database.'))

const guitarsRouter = require('./routes');
app.use('/api/guitars', guitarsRouter);

app.use('/graphql', graphqlHTTP({ // set up our graphql endpoint with the express-graphql middleware
  // build a graphql schema
  schema: buildSchema(`
      type Guitar {
        _id: ID!
        brand: String!
        shape: String!
        name: String!
        series: String!
        pickups: String!
        tremolo: String
        frets: String!
        tuners: String!
        colour: String!
        fretboard: String!
        filename: String
        description: String!
      }
      
      type guitarQuery {
          guitars: [Guitar!]!
      }

      schema {
          query: guitarQuery
      }
  `),
  rootValue: {
    guitars: async () => {
      const guitars = await Guitar.find();
      return guitars;
    }
  },
  graphiql: true
}))

const root = path.join(__dirname, './client', 'build')
app.use(express.static(root));
app.use(compression());

app.get("*", (req, res) => {
  res.sendFile('index.html', { root });
})

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
});