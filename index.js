const app = require("./express/server");
const port = process.env.port || 3000;
app.listen(port, () => console.log(`Running server on port ${port}`));