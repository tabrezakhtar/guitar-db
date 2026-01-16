const jwt = require("jsonwebtoken");
const { Equipment, Comments } = require("../models/equipment");

const generateTokens = (userId, jwtSecret) => {
  const accessToken = jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

const verifyTokenSafe = (token, secret) => {
  return jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return { valid: false, error: err.name, decoded: null };
    }
    return { valid: true, error: null, decoded };
  });
};

const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).json({
      message: "No access token, authorization denied",
      errors: "Authentication required"
    });
  }

  if (!refreshToken) {
    return res.status(401).json({
      message: "No refresh token, authorization denied",
      errors: "Authentication required"
    });
  }

  const accessResult = verifyTokenSafe(accessToken, process.env.JWT_SECRET);

  if (accessResult.valid) {
    req.userId = accessResult.decoded.id;
    return next();
  }

  if (accessResult.error === "TokenExpiredError") {
    const refreshResult = verifyTokenSafe(refreshToken, process.env.JWT_SECRET);
    
    if (refreshResult.valid) {
      const { accessToken: newAccessToken } = generateTokens(refreshResult.decoded.id, process.env.JWT_SECRET);
      const isProd = process.env.NODE_ENV === "production";
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        path: "/",
        maxAge: 15 * 60 * 1000
      });
      req.userId = refreshResult.decoded.id;
      return next();
    }

    return res.status(401).json({
      message: "Refresh token expired or invalid",
      errors: "Your session has expired. Please log in again."
    });
  }

  return res.status(401).json({
    message: "Token is not valid",
    errors: "Invalid authentication token"
  });
};

const checkEquipmentOwnership = async (req, res, next) => {
  try {
    
    const equipmentId = req.params.id || req.body.equipmentId;
    
    if (!equipmentId) {
      return res.status(400).json({
        message: "Equipment ID is required",
        errors: "Equipment ID is required for this operation"
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    
    if (!equipment) {
      return res.status(404).json({
        message: "Equipment not found",
        errors: "The specified equipment could not be found"
      });
    }

    
    if (equipment.user && equipment.user.toString() !== req.userId) {
      return res.status(403).json({
        message: "Not authorized",
        errors: "You are not authorized to modify this equipment"
      });
    }

    req.equipment = equipment;
    next();
  } catch (err) {
    next(err);
  }
};

const checkUserOwnership = async (req, res, next) => {
  try {
    
    const userIdToCheck = req.params.userId || req.body._id || req.body.userId || req.query.userId;
    
    if (!userIdToCheck) {
      return res.status(400).json({
        message: "User ID is required",
        errors: "User ID is required for this operation"
      });
    }

  if (userIdToCheck !== req.userId) {
      return res.status(403).json({
        message: "Not authorized",
        errors: "You are not authorized to modify this user profile"
      });
    }
  
    next();
  } catch (err) {
    next(err);
  }
};

const checkCommentOwnership = async (req, res, next) => {
  try {
    const commentId = req.params.id || req.body.commentId;
    
    if (!commentId) {
      return res.status(400).json({
        message: "Comment ID is required",
        errors: "Comment ID is required for this operation"
      });
    }

    const comment = await Comments.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
        errors: "The specified comment could not be found"
      });
    }

    if (comment.user && comment.user.toString() !== req.userId) {
      return res.status(403).json({
        message: "Not authorized",
        errors: "You are not authorized to delete this comment"
      });
    }

    req.comment = comment;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  verifyToken,
  checkEquipmentOwnership,
  checkUserOwnership,
  checkCommentOwnership
};
