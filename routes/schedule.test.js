jest.mock("../models/schedule", () => ({
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOneAndDelete: jest.fn(),
  find: jest.fn()
}));
jest.mock("../models/user", () => ({}));

const Schedule = require("../models/schedule");
const { getSchedule, updateSchedule, deleteSchedule, getWeeklySchedule } = require("./schedule");

function createResponse() {
  const res = { status: jest.fn(), json: jest.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("schedule routes", () => {
  beforeEach(() => jest.clearAllMocks());

  test("requires a user ID when reading a schedule", async () => {
    const res = createResponse();

    await getSchedule({ query: {} }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "userId is required" });
    expect(Schedule.findOne).not.toHaveBeenCalled();
  });

  test("upserts schedule data and truncates event text", async () => {
    const schedule = { userId: "user-1" };
    Schedule.findOneAndUpdate.mockResolvedValue(schedule);
    const res = createResponse();

    await updateSchedule({
      userId: "user-1",
      body: {
        timezone: "Europe/London",
        liveSchedules: [{ title: "t".repeat(205), description: "d".repeat(505), duration: 45 }]
      }
    }, res);

    const [filter, update, options] = Schedule.findOneAndUpdate.mock.calls[0];
    expect(filter).toEqual({ userId: "user-1" });
    expect(update.$set.timezone).toBe("Europe/London");
    expect(update.$set.liveSchedules[0].title).toHaveLength(200);
    expect(update.$set.liveSchedules[0].description).toHaveLength(500);
    expect(update.$set.liveSchedules[0].duration).toBe(45);
    expect(options).toEqual({ new: true, upsert: true, setDefaultsOnInsert: true });
    expect(res.json).toHaveBeenCalledWith(schedule);
  });

  test("returns not found when deleting a missing schedule", async () => {
    Schedule.findOneAndDelete.mockResolvedValue(null);
    const res = createResponse();

    await deleteSchedule({ userId: "user-1" }, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Schedule not found" });
  });

  test("maps weekly schedule entries for display", async () => {
    const user = { _id: "user-1", username: "riff", youtubeChannelAvatar: "avatar" };
    const schedules = [{
      userId: user,
      timezone: "UTC",
      liveSchedules: [{ day: "Friday", time: "19:00", title: "Live" }]
    }];
    Schedule.find.mockReturnValue({ populate: jest.fn().mockResolvedValue(schedules) });
    const res = createResponse();

    await getWeeklySchedule({}, res);

    expect(res.json).toHaveBeenCalledWith({
      schedules: [{
        userId: "user-1",
        username: "riff",
        youtubeChannelAvatar: "avatar",
        youtubeChannelBanner: "",
        youtubeChannelUrl: "",
        timezone: "UTC",
        day: "Friday",
        time: "19:00",
        title: "Live",
        description: "",
        duration: null
      }]
    });
  });
});