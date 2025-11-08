const equipmentRoutes = require("./equipment");

async function landing(req, res, next) {
  try {
    const recentPromise = new Promise((resolve, reject) => {
      const mockReq = {
        query: {
          page: 1,
          limit: 5,
          sortBy: "date",
          sortOrder: "desc"
        },
        user: req.user
      };
      
      const mockRes = {
        status: () => ({
          send: (data) => resolve(data),
          json: (data) => resolve(data)
        })
      };
      
      const mockNext = (err) => reject(err);
      
      equipmentRoutes.get(mockReq, mockRes, mockNext).catch(reject);
    });

    const popularPromise = new Promise((resolve, reject) => {
      const mockReq = {
        query: {
          page: 1,
          limit: 5,
          sortBy: "likesCount",
          sortOrder: "desc"
        },
        user: req.user
      };
      
      const mockRes = {
        status: () => ({
          send: (data) => resolve(data),
          json: (data) => resolve(data)
        })
      };
      
      const mockNext = (err) => reject(err);
      
      equipmentRoutes.get(mockReq, mockRes, mockNext).catch(reject);
    });

    const [recentData, popularData] = await Promise.all([
      recentPromise,
      popularPromise
    ]);

    res.status(200).json({
      recent: recentData.items || [],
      popular: popularData.items || []
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  landing
};