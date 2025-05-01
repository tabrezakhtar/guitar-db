const express = require("express");
const router = express.Router();
const equipmentRoutes = require("./equipment");
const { login, register, getUserProfile, createUserProfile, updateUserProfile, verifyMagicLink, deleteUserAvatar } = require("./users");

router.get("/equipmentList/", equipmentRoutes.get);
router.get("/equipmentById/", equipmentRoutes.getById);
router.get("/equipment/filterBy", equipmentRoutes.filter);
router.post("/equipment/add", equipmentRoutes.add);
router.put("/equipment/update/:id", equipmentRoutes.update);
router.delete("/equipment/remove/:id", equipmentRoutes.remove);
router.delete("/equipment/deleteImage/:id", equipmentRoutes.deleteImage);
router.get("/equipment/settings", equipmentRoutes.settings);
router.post("/equipment/addComment", equipmentRoutes.addComment);

router.post("/users/login", login);
router.post("/users/register", register);
router.get("/users/profile", getUserProfile);
router.post("/users/createProfile", createUserProfile);
router.put("/users/updateProfile", updateUserProfile);
router.post("/users/verifyMagicLink", verifyMagicLink);
router.delete("/users/deleteAvatar", deleteUserAvatar);

module.exports = router;