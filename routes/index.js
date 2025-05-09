const express = require("express");
const router = express.Router();
const equipmentRoutes = require("./equipment");
const { login, register, getUserProfile, createUserProfile, updateUserProfile, verifyMagicLink, deleteUserAvatar, refreshToken } = require("./users");
const { verifyToken, checkEquipmentOwnership, checkUserOwnership } = require("../middleware/auth");

router.get("/equipmentList/", equipmentRoutes.get);
router.get("/equipmentById/", equipmentRoutes.getById);
router.get("/equipment/filterBy", equipmentRoutes.filter);
router.post("/equipment/add", verifyToken, equipmentRoutes.add);
router.put("/equipment/update/:id", verifyToken, checkEquipmentOwnership, equipmentRoutes.update);
router.delete("/equipment/remove/:id", verifyToken, checkEquipmentOwnership, equipmentRoutes.remove);
router.delete("/equipment/deleteImage/:id", verifyToken, checkEquipmentOwnership, equipmentRoutes.deleteImage);
router.get("/equipment/settings", equipmentRoutes.settings);
router.post("/equipment/addComment", verifyToken, equipmentRoutes.addComment);
router.get("/equipment/tags", equipmentRoutes.getAllTags);
router.get("/equipment/user/:userId", equipmentRoutes.getByUser);

router.post("/users/login", login);
router.post("/users/register", register);
router.get("/users/profile", getUserProfile);
router.post("/users/createProfile", createUserProfile);
router.put("/users/updateProfile", verifyToken, checkUserOwnership, updateUserProfile);
router.post("/users/refreshToken", refreshToken);
router.post("/users/verifyMagicLink", verifyMagicLink);
router.delete("/users/deleteAvatar", verifyToken, checkUserOwnership, deleteUserAvatar);

module.exports = router;