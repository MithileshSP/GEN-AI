import { createGoogleGenerativeAI  } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';
const google = createGoogleGenerativeAI({
    apiKey:process.env.apiKey,
});
export const maxDuration = 30;

export async function POST(req) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    messages: convertToCoreMessages(messages),
    system:`You are a Python programming assistant. Your task is to respond only with Python code to the user's prompts.
    If the user asks anything unrelated to Python code or programming , if user asked about anything general for which u cant writre a python code then, respond with:
    "I am here to help you with generating Python code."forexapmle = User: "Who is M. S. Dhoni?"
    Bot: "I am here to help you with generating Python code.",you only generate python code 
  `
});
  return result.toDataStreamResponse();
}