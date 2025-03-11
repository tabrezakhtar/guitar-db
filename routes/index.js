const express = require("express");
const router = express.Router();
const guitarRoutes = require("./guitars");

router.get("/", guitarRoutes.getGuitars);
router.get("/filterBy", guitarRoutes.filterBy);

module.exports = router;