const express = require("express");
const router = express.Router();
const equipmentRoutes = require("./equipment");
const userRoutes = require("./users");

//equipment
router.get("/equipment/", equipmentRoutes.get);
router.get("/equipment/", equipmentRoutes.getById);
router.get("/equipment/filterBy", equipmentRoutes.filter);
router.post("/equipment/add", equipmentRoutes.add);
router.put("/equipment/update/:id", equipmentRoutes.update);
router.delete("/equipment/remove/:id", equipmentRoutes.remove);
router.delete("/equipment/deleteImage/:id", equipmentRoutes.deleteImage);
router.get("/equipment/settings", equipmentRoutes.settings);

//login
router.post("/users/login", userRoutes.login);
router.post("/users/register", userRoutes.register);

module.exports = router;