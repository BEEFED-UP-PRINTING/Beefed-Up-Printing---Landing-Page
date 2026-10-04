import OpenAI from "openai";

const DEFAULT_BASE_URL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? "https://api.openai.com/v1";
const DEFAULT_API_KEY = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? "";

export function getOpenAIConfig() {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY ?? process.env.OPENAI_API_KEY ?? "";
  const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ?? DEFAULT_BASE_URL;

  return {
    apiKey,
    baseURL,
  };
}

export function getPreferredOpenAIModel(fallback = "gpt-4o-mini") {
  return process.env.OPENAI_MODEL ?? process.env.AI_INTEGRATIONS_OPENAI_MODEL ?? fallback;
}

export function getOpenAIClient() {
  const { apiKey, baseURL } = getOpenAIConfig();

  if (!apiKey) {
    throw new Error(
      "OpenAI is not configured. Add the OpenAI integration in Replit or set OPENAI_API_KEY.",
    );
  }

  return new OpenAI({ apiKey, baseURL });
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    const client = getOpenAIClient();
    const value = Reflect.get(client as object, prop as PropertyKey);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
