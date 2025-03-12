const express = require("express");
const router = express.Router();
const guitarRoutes = require("./guitars");

router.get("/", guitarRoutes.get);
router.get("/filterBy", guitarRoutes.filter);
router.post("/", guitarRoutes.create);
router.put("/:id", guitarRoutes.update);

module.exports = router;