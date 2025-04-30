const express = require("express");
const router = express.Router();
const equipmentRoutes = require("./equipment");
const userRoutes = require("./users");

//equipment
router.get("/equipmentList/", equipmentRoutes.get);
router.get("/equipmentById/", equipmentRoutes.getById);
router.get("/equipment/filterBy", equipmentRoutes.filter);
router.post("/equipment/add", equipmentRoutes.add);
router.put("/equipment/update/:id", equipmentRoutes.update);
router.delete("/equipment/remove/:id", equipmentRoutes.remove);
router.delete("/equipment/deleteImage/:id", equipmentRoutes.deleteImage);
router.get("/equipment/settings", equipmentRoutes.settings);
router.post("/equipment/addComment", equipmentRoutes.addComment);

//login
router.post("/users/login", userRoutes.login);
router.post("/users/register", userRoutes.register);
router.get("/users/profile", userRoutes.getUserProfile);
router.post("/users/createProfile", userRoutes.createUserProfile);
router.post("/users/verifyMagicLink", userRoutes.verifyMagicLink);

module.exports = router;