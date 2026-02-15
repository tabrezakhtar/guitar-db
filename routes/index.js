const express = require("express");
const router = express.Router();
const equipmentRoutes = require("./equipment");
const pagesRoutes = require("./pages");
const { getYoutubeVideosByUser, saveYoutubeChannel, proxyYoutubeImage } = require("./youtube");

const { registerUser, verifyCode, resendVerificationCode, guestLogin } = require("./register");
const { getUserProfile, updateUserProfile, deleteUserAvatar, deleteUserProfile } = require("./profile");
const { logout, getUserStatus, followUser, unfollowUser, me, getFollowers, getFollowing } = require("./users");
const { verifyToken, checkEquipmentOwnership, checkUserOwnership, checkCommentOwnership } = require("../middleware/auth");
const { authLimiter, magicLinkLimiter, testMagicLinkLimiter, testRefreshLimiter } = require("../middleware/rateLimiter");

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
router.delete("/equipment/deleteComment/:id", verifyToken, checkCommentOwnership, equipmentRoutes.deleteComment);
router.get("/equipment/tags", equipmentRoutes.getAllTags);
router.get("/equipment/user/:userId", equipmentRoutes.getByUser);
router.get("/equipment/searchByText", equipmentRoutes.searchByText);

router.get("/pages/landing", pagesRoutes.landing);

router.post("/auth/register", registerUser);
router.post("/auth/sendCode", magicLinkLimiter, resendVerificationCode);
router.post("/auth/verifyCode", authLimiter, verifyCode);
router.post("/auth/guestLogin", guestLogin);

router.get("/profile/get", getUserProfile);
router.put("/profile/update", verifyToken, checkUserOwnership, updateUserProfile);
router.delete("/profile/deleteAvatar", verifyToken, checkUserOwnership, deleteUserAvatar);
router.delete("/profile/delete", verifyToken, checkUserOwnership, deleteUserProfile);

router.post("/users/follow", verifyToken, followUser);
router.post("/users/unfollow", verifyToken, unfollowUser);
router.get("/users/followers", getFollowers);
router.get("/users/following", getFollowing);
router.post("/users/logout", verifyToken, logout);
router.get("/users/status", verifyToken, getUserStatus);
router.get("/users/me", verifyToken, me);
router.post("/test/magic-link", testMagicLinkLimiter, (req, res) => {
  res.json({ message: "Test magic link endpoint", timestamp: new Date().toISOString() });
});

router.post("/test/refresh", testRefreshLimiter, (req, res) => {
  res.json({ message: "Test refresh endpoint", timestamp: new Date().toISOString() });
});

router.get("/youtube/videos", getYoutubeVideosByUser);
router.post("/youtube/channel", verifyToken, saveYoutubeChannel);
router.get("/youtube/image-proxy", proxyYoutubeImage);

module.exports = router;