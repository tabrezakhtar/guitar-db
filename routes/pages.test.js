jest.mock("./equipment", () => ({ get: jest.fn() }));

const equipmentRoutes = require("./equipment");
const { landing } = require("./pages");

function createResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("landing route", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns recent and popular equipment results", async () => {
    equipmentRoutes.get.mockImplementation(async (req, res) => {
      res.status(200).json({ items: [req.query.sortBy] });
    });
    const req = { user: { id: "user-1" } };
    const res = createResponse();
    const next = jest.fn();

    await landing(req, res, next);

    expect(equipmentRoutes.get).toHaveBeenCalledTimes(2);
    expect(equipmentRoutes.get.mock.calls.map(([mockReq]) => mockReq.query)).toEqual([
      { page: 1, limit: 5, sortBy: "date", sortOrder: "desc" },
      { page: 1, limit: 5, sortBy: "likesCount", sortOrder: "desc" }
    ]);
    expect(equipmentRoutes.get.mock.calls[0][0].user).toBe(req.user);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ recent: ["date"], popular: ["likesCount"] });
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards an equipment route failure to next", async () => {
    const error = new Error("equipment query failed");
    equipmentRoutes.get.mockRejectedValue(error);
    const next = jest.fn();

    await landing({ user: null }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(error);
  });
});