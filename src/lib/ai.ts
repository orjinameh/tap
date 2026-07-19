import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function aiSummarize(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`Summarize the following text concisely:\n\n${text}`);
  return result.response.text();
}

export async function aiTranslate(text: string, targetLang: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`Translate the following text to ${targetLang}:\n\n${text}`);
  return result.response.text();
}

export async function aiCodeReview(code: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`Review the following code. Provide specific suggestions for improvement, potential bugs, and best practices:\n\n${code}`);
  return result.response.text();
}

export async function aiGenerate(prompt: string, type: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`Generate a ${type} based on this prompt:\n\n${prompt}`);
  return result.response.text();
}

export async function aiExplain(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`Explain the following in simple terms:\n\n${text}`);
  return result.response.text();
}

export async function aiClassify(text: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(`Classify the following text into categories (e.g., topic, sentiment, intent). Return JSON with "categories" array:\n\n${text}`);
  return result.response.text();
}
