const express = require("express");
const router = express.Router();
const guitarRoutes = require("./guitars");

router.get("/", guitarRoutes.getGuitars);
router.get("/filterBy", guitarRoutes.filterBy);
router.post("/", guitarRoutes.createGuitar);
router.put("/:id", guitarRoutes.updateGuitar);

module.exports = router;