import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(request) {
  try {
    const { userInput } = await request.json();
    
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

    return new Response(JSON.stringify({ quote: text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error fetching Gemini AI response:", error);
    return new Response(
      JSON.stringify({ error: "Could not fetch a quote at this time." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}