import { streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: "AIzaSyAhujWA-R8iHRJ-fBTm_VMaIS8YLBz46j0",
});

const schema = z.object({
  platform: z.string(),
  caption: z.string(),
  hashtags: z.string(),
  mediaSuggestion: z.string(),
});

export async function POST(req) {
  try {
    const { platform, topic } = await req.json();

    const { partialObjectStream } = streamObject({
      model: google("gemini-1.5-flash"),
      schema: schema,
      prompt: `You are a content creator assistant, if user given an invalid propmt topic then dont generate content just tell that i am here to give u a content about ur topic so give me a valid topic . Generate trending content for ${platform} based on the topic "${topic}". Provide a catchy caption, trending hashtags, and media suggestions.`,
      system:
        "You specialize in creating social media content that aligns with current platform trends.",
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of partialObjectStream) {
            console.log("Streaming chunk:", chunk);
            controller.enqueue(new TextEncoder().encode(`${JSON.stringify(chunk)}\n`));
          }
        } catch (error) {
          console.error("Streaming error:", error);
        } finally {
          controller.close();
        }
      },
    });
    

    return new Response(stream, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
