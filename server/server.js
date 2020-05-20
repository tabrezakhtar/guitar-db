const express = require('express')
const app = express()
const path = require('path');
const port = process.env.PORT || 5000;

app.get('/api/guitars', (req, res) =>
  res.send([
    { id: 1, name: 'Fender' },
    { id: 2, name: 'PRS' },
    { id: 3, name: 'Gibson' }
  ])
);

const root = path.join(__dirname, '../client', 'build')
app.use(express.static(root));
app.get("*", (req, res) => {
    res.sendFile('index.html', { root });
})

app.listen(port, () => {
  console.log(`App started on port: ${port}`)
});