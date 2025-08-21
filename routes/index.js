const express = require("express");
const router = express.Router();
const equipmentRoutes = require("./equipment");
const { login, createUserProfile, refreshToken } = require("./auth");
const { registerUser, verifyCode, resendVerificationCode } = require("./register");
const { getUserProfile, updateUserProfile, deleteUserAvatar, deleteUserProfile } = require("./users");
const { verifyToken, checkEquipmentOwnership, checkUserOwnership } = require("../middleware/auth");
const { authLimiter, magicLinkLimiter, refreshTokenLimiter, createProfileLimiter, testMagicLinkLimiter, testRefreshLimiter } = require("../middleware/rateLimiter");

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

// router.post("/auth/login", login);
router.post("/auth/register", registerUser);
router.post("/auth/createProfile", createProfileLimiter, createUserProfile);
router.post("/auth/sendCode", magicLinkLimiter, resendVerificationCode);
router.post("/auth/refreshToken", refreshTokenLimiter, refreshToken);
router.post("/auth/verifyCode", authLimiter, verifyCode);
router.get("/users/profile", getUserProfile);
router.put("/users/updateProfile", verifyToken, checkUserOwnership, updateUserProfile);
router.delete("/users/deleteAvatar", verifyToken, checkUserOwnership, deleteUserAvatar);
router.delete("/users/deleteProfile", verifyToken, checkUserOwnership, deleteUserProfile);
router.get("/test/success", (req, res) => {
  res.render("success", { status: "success", message: "Template test successful" });
});
// Test routes for rate limiting
router.post("/test/magic-link", testMagicLinkLimiter, (req, res) => {
  res.json({ message: "Test magic link endpoint", timestamp: new Date().toISOString() });
});

router.post("/test/refresh", testRefreshLimiter, (req, res) => {
  res.json({ message: "Test refresh endpoint", timestamp: new Date().toISOString() });
});

module.exports = router;