const express = require("express");
const router = express.Router();
const guitarRoutes = require("./guitars");
const userRoutes = require("./users");

//guitars
router.get("/guitars/", guitarRoutes.get);
router.get("/guitar/", guitarRoutes.getById);
router.get("/guitars/filterBy", guitarRoutes.filter);
router.post("/guitars/add", guitarRoutes.add);
router.put("/guitars/update/:id", guitarRoutes.update);
router.delete("/guitars/remove/:id", guitarRoutes.remove);
router.delete("/guitars/deleteImage/:id", guitarRoutes.deleteImage);
router.get("/guitar/settings", guitarRoutes.settings);

//login
router.post("/users/login", userRoutes.login);
router.post("/users/register", userRoutes.register);

module.exports = router;