const express = require('express')
const app = express()
const path = require('path');
const compression = require('compression');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose')

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

const guitarsRouter = require('./routes/guitars')
app.use('/api/guitars', guitarsRouter)

// app.get('/api/test', async (req, res) => {
//   //res.send(process.env.testKey)
//   //const result = await guitarsCollection.findOne({ name: nameOfListing });
//   res.send(result);
// });

const root = path.join(__dirname, './client', 'build')
app.use(express.static(root));
app.use(compression());
app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
});