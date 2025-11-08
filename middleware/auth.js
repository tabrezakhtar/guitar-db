const jwt = require("jsonwebtoken");
const { Equipment } = require("../models/equipment");

const verifyToken = (req, res, next) => {
  
  const token = req.header("Authorization")?.replace("Bearer ", "") || req.header("x-auth-token");

  
  if (!token) {
    return res.status(401).json({
      message: "No token, authorization denied",
      errors: "Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.id;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        errors: "Your session has expired. Please log in again."
      });
    }
    return res.status(401).json({
      message: "Token is not valid",
      errors: "Invalid authentication token"
    });
  }
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

module.exports = {
  verifyToken,
  checkEquipmentOwnership,
  checkUserOwnership
};
