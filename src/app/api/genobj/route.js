import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

// Initialize the Google Generative AI client with the correct environment variable
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY, // Fixed API key reference
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

export async function POST(request) {
  try {
    // Extract the user input from the request
    const { userInput } = await request.json();
    
    // Log the user's input (project idea)
    console.log("User project idea:", userInput);

    // Construct a prompt asking the AI to break the project down into manageable steps
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

    // Call the AI model to generate the project breakdown
    const generatedProjectGuide = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: projectSchema,
      prompt: prompt,
      system:
        "you are a chatbot which gives idea on project development,for any input which is other than a valid project title",
    });

    // Return the project guide breakdown as a JSON response
    return new Response(JSON.stringify({ projectData: generatedProjectGuide.object }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error generating project guide:", error);
    return new Response(
      JSON.stringify({
        error: "Could not generate a project guide at this time.",
        projectData: {
          projectTitle: "Error: Could not generate a project guide.",
          breakdownSteps: [],
          nextAction: "",
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Keep this function for compatibility with existing code, but it's not directly used by the API route
export async function handleGenerateProject(userInput) {
  try {
    const response = await fetch('/api/genobj', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput }),
    });
    
    const data = await response.json();
    if (response.ok) {
      return data.projectData;
    } else {
      throw new Error(data.error || "Failed to generate project guide");
    }
  } catch (error) {
    console.error("Error generating project guide:", error);
    return {
      projectTitle: "Error: Could not generate a project guide.",
      breakdownSteps: [],
      nextAction: "",
    };
  }
}