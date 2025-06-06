const express = require("express");
const router = express.Router();
const equipmentRoutes = require("./equipment");
const { login, register, createUserProfile, sendMagicLink, verifyMagicLink, refreshToken } = require("./auth");
const { getUserProfile, updateUserProfile, deleteUserAvatar } = require("./users");
const { verifyToken, checkEquipmentOwnership, checkUserOwnership } = require("../middleware/auth");

router.get("/equipment/list/", equipmentRoutes.get);
router.get("/equipment/byid/", equipmentRoutes.getById);
router.get("/equipment/filterBy", equipmentRoutes.filter);
router.post("/equipment/add", verifyToken, equipmentRoutes.add);
router.put("/equipment/update/:id", verifyToken, checkEquipmentOwnership, equipmentRoutes.update);
router.delete("/equipment/remove/:id", verifyToken, checkEquipmentOwnership, equipmentRoutes.remove);
router.delete("/equipment/deleteImage/:id", verifyToken, checkEquipmentOwnership, equipmentRoutes.deleteImage);
router.post("/equipment/toggleLike/:id", verifyToken, equipmentRoutes.toggleLike);
router.get("/equipment/settings", equipmentRoutes.settings);
router.post("/equipment/addComment", verifyToken, equipmentRoutes.addComment);
router.get("/equipment/tags", equipmentRoutes.getAllTags);
router.get("/equipment/user/:userId", equipmentRoutes.getByUser);
router.get("/equipment/searchByText", equipmentRoutes.searchByText);

router.post("/auth/login", login);
router.post("/auth/register", register);
router.post("/auth/createProfile", createUserProfile);
router.post("/auth/sendMagicLink", sendMagicLink);
router.post("/auth/refreshToken", refreshToken);
router.post("/auth/verifyMagicLink", verifyMagicLink);
router.get("/users/profile", getUserProfile);
router.put("/users/updateProfile", verifyToken, checkUserOwnership, updateUserProfile);
router.delete("/users/deleteAvatar", verifyToken, checkUserOwnership, deleteUserAvatar);

module.exports = router;