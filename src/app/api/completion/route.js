import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyDg9tiwQGQcJbSCZvHn4QxN1w8UvYR1-RM",
});

let chatHistory = [];

export async function handleGenerateText(userInput) {
  try {
    chatHistory.push({ role: "user", content: userInput });
    const prompt = `
    Generate an inspirational or thought-provoking quote based on the following input: 
    "${userInput}"
    Make sure the quote is meaningful and provides insight into the subject.
    `;

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
      temperature: 0.7,
    });

    chatHistory.push({ role: "ai", content: text });

    return text;
  } catch (error) {
    console.error("Error fetching Gemini AI response:", error);
    return "Error: Could not fetch a quote at this time.";
  }
}
