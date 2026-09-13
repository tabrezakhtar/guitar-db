const OpenAI = require("openai");

const { OPENROUTER_API_KEY } = process.env;

const client = OPENROUTER_API_KEY ? new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY
}) : null;

function buildEquipmentPrompt(equipment) {
  const { type, brand, name, shape, ampType, effectType, year, tags, why, description } = equipment || {};

  const details = [
    type && `Type: ${type}`,
    brand && `Brand: ${brand}`,
    name && `Model/Name: ${name}`,
    shape && `Shape: ${shape}`,
    ampType && `Amp Type: ${ampType}`,
    effectType && `Effect Type: ${effectType}`,
    year && `Year: ${year}`,
    tags?.length && `Tags: ${tags.map(tag => tag.name || tag).join(", ")}`,
    why && `Why it's special: ${why}`,
    description && `Existing notes: ${description}`
  ].filter(Boolean).join("\n");

  return `Write a short, engaging description (2-4 sentences) for the following piece of music gear, to be shown on a gear collector's profile. Write in a natural, human tone. Only return the description text, no headings or extra commentary.  Make sure to format it nicely with line breaks.\n\n${details}`;
}

async function generateEquipmentDescription(equipment) {
  if (!client) {
    throw new Error("Missing OPENROUTER_API_KEY in environment");
  }

  const model = process.env.OPENROUTER_MODEL
    ? `${process.env.OPENROUTER_MODEL}@preset/equipment-description-generator`
    : "@preset/equipment-description-generator";

  const apiResponse = await client.chat.completions.create({
    model,
    messages: [{
      role: "user",
      content: buildEquipmentPrompt(equipment)
    }]
  });

  return apiResponse.choices[0]?.message?.content?.trim() || "";
}

module.exports = { generateEquipmentDescription };
