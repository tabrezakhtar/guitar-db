const mockCreate = jest.fn();

jest.mock("openai", () => jest.fn().mockImplementation(() => ({
  chat: {
    completions: {
      create: mockCreate
    }
  }
})));

const originalApiKey = process.env.OPENROUTER_API_KEY;
const originalModel = process.env.OPENROUTER_MODEL;

function loadOpenrouter() {
  jest.resetModules();
  const OpenAI = require("openai");
  const openrouter = require("./openrouter");
  return { OpenAI, ...openrouter };
}

describe("generateEquipmentDescription", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENROUTER_API_KEY = "test-api-key";
    delete process.env.OPENROUTER_MODEL;
  });

  afterAll(() => {
    if (originalApiKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalApiKey;
    }

    if (originalModel === undefined) {
      delete process.env.OPENROUTER_MODEL;
    } else {
      process.env.OPENROUTER_MODEL = originalModel;
    }
  });

  test("sends equipment details using the default model and trims the response", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "  A classic guitar.\n  " } }]
    });
    const { OpenAI, generateEquipmentDescription } = loadOpenrouter();

    const result = await generateEquipmentDescription({
      type: "guitar",
      brand: "Fender",
      name: "Stratocaster",
      shape: "S-type",
      year: 1962,
      tags: [{ name: "vintage" }, "electric"],
      why: "A first guitar",
      description: "Well played"
    });

    expect(OpenAI).toHaveBeenCalledWith({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: "test-api-key"
    });
    expect(mockCreate).toHaveBeenCalledWith({
      model: "@preset/equipment-description-generator",
      messages: [{
        role: "user",
        content: expect.stringContaining("Type: guitar")
      }]
    });
    const prompt = mockCreate.mock.calls[0][0].messages[0].content;
    expect(prompt).toContain("Brand: Fender");
    expect(prompt).toContain("Model/Name: Stratocaster");
    expect(prompt).toContain("Tags: vintage, electric");
    expect(prompt).toContain("Why it's special: A first guitar");
    expect(prompt).toContain("Existing notes: Well played");
    expect(result).toBe("A classic guitar.");
  });

  test("uses the configured model with the equipment description preset", async () => {
    process.env.OPENROUTER_MODEL = "custom-model";
    mockCreate.mockResolvedValue({ choices: [{ message: { content: "Description" } }] });
    const { generateEquipmentDescription } = loadOpenrouter();

    await generateEquipmentDescription({ name: "Jazz Bass" });

    expect(mockCreate.mock.calls[0][0].model)
      .toBe("custom-model@preset/equipment-description-generator");
  });

  test("returns an empty string when the response has no usable content", async () => {
    mockCreate.mockResolvedValue({ choices: [{ message: { content: "  " } }] });
    const { generateEquipmentDescription } = loadOpenrouter();

    await expect(generateEquipmentDescription({})).resolves.toBe("");
  });

  test("rejects with a clear error when the API key is missing", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const { OpenAI, generateEquipmentDescription } = loadOpenrouter();

    await expect(generateEquipmentDescription({})).rejects.toThrow(
      "Missing OPENROUTER_API_KEY in environment"
    );
    expect(OpenAI).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});