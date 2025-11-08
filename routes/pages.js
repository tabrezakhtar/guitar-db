const equipmentRoutes = require("./equipment");

async function landing(req, res) {
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
      
      equipmentRoutes.get(mockReq, mockRes).catch(reject);
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
      
      equipmentRoutes.get(mockReq, mockRes).catch(reject);
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
    res.status(500).json({
      message: err.message,
      errors: "Failed to retrieve landing page data"
    });
  }
}

module.exports = {
  landing
};