import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

// Initialize the Google Generative AI client with your API key
const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyDg9tiwQGQcJbSCZvHn4QxN1w8UvYR1-RM", // Replace this with your actual Google API key
});

// Define a schema to validate the instructional response for project guidance
const projectSchema = z.object({
  projectTitle: z.string(),
  breakdownSteps: z.array(
    z.object({
      stepTitle: z.string(),
      stepDescription: z.string(),
      codeSnippet: z.string().optional(),
      resources: z.string().optional(),
    })
  ),
  nextAction: z.string().optional(),
});

export async function handleGenerateProject(userInput) {
  try {
    // Step 1: Log the user's input (project idea) into chat history
    console.log("User project idea:", userInput);

    // Step 2: Construct a prompt asking the AI to break the project down into manageable steps
    const prompt = `
    Generate a step-by-step guide for building a project on the following topic if the user gives any irrelavent thing say give me a valid topic: 
    "${userInput}"
    if suppose the user inputed a irrelavent thing aprat from any prject type tell that give me a valid project title, if user tells hi reply tell me a prject topic,
    The guide should include:
    - The overall project title
    - A breakdown of steps, with each step consisting of:
      1. A title (Step name)
      2. A description or explanation of the task
      3. (Optional) Code snippets for the step
      4. (Optional) Links or resources to help with the step
    - Suggested next action after completing the project (if applicable).
    
    `;

    // Step 3: Call the AI model to generate the project breakdown
    const generatedProjectGuide = await generateObject({
      model: google("gemini-1.5-flash"), // AI model for generating the response
      schema: projectSchema, // Validate the response using the project schema
      prompt: prompt, // Send the user's project idea as a prompt
      system:
        "you are a chatbot which gives idea on project development,for any input which is other than a valid project title",
    });

    // Step 4: Return the project guide breakdown
    return generatedProjectGuide.object;
  } catch (error) {

    console.error("Error generating project guide:", error);
    return {
      projectTitle: "Error: Could not generate a project guide.",
      breakdownSteps: [],
      nextAction: "",
    };
  }
}
