import { streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const schema = z.object({
  platform: z.string(),
  caption: z.string(),
  hashtags: z.string(),
  mediaSuggestion: z.string(),
});

// Simple in-memory rate limiting
const rateLimit = {
  requests: {},
  checkLimit: function(ip) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 10; // Keep under the API's 15 req/min limit
    
    // Initialize or cleanup old entries
    if (!this.requests[ip]) {
      this.requests[ip] = [];
    }
    
    // Remove timestamps older than the current window
    this.requests[ip] = this.requests[ip].filter(
      timestamp => now - timestamp < windowMs
    );
    
    // Check if user has exceeded the rate limit
    if (this.requests[ip].length >= maxRequests) {
      return false;
    }
    
    // Add current request timestamp
    this.requests[ip].push(now);
    return true;
  }
};

export async function POST(req) {
  try {
    // Get client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    
    // Check rate limit
    if (!rateLimit.checkLimit(ip)) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later."
        }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json",
            "Retry-After": "60"
          } 
        }
      );
    }

    const { platform, topic } = await req.json();

    if (!platform || !topic) {
      return new Response(
        JSON.stringify({ error: "Platform and topic are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const { partialObjectStream } = await streamObject({
        model: google("gemini-1.5-flash"),
        schema: schema,
        prompt: `You are a content creator assistant, if user given an invalid prompt topic then don't generate content just tell that I am here to give you content about your topic so give me a valid topic. Generate trending content for ${platform} based on the topic "${topic}". Provide a catchy caption, trending hashtags, and media suggestions. Create 3 unique content ideas.`,
        system:
          "You specialize in creating social media content that aligns with current platform trends. Ensure each content idea is complete with platform, caption, hashtags, and media suggestion.",
        // Adding retry configuration
        retry: {
          attempts: 2,
          initialDelay: 1000,
          maxDelay: 5000,
        },
      });

      // Accumulate complete objects before sending
      let completedObjects = [];
      let partialObject = {};
      
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of partialObjectStream) {
              console.log("Streaming chunk:", chunk);
              
              // Merge the new chunk into our partial object
              partialObject = { ...partialObject, ...chunk };
              
              // Check if we have a complete object
              if (partialObject.platform && 
                  partialObject.caption && 
                  partialObject.hashtags && 
                  partialObject.mediaSuggestion) {
                
                // Add to completed objects
                completedObjects.push({ ...partialObject });
                
                // Send the complete object
                controller.enqueue(new TextEncoder().encode(
                  `${JSON.stringify(partialObject)}\n`
                ));
                
                // Reset our partial object to start collecting the next one
                partialObject = {};
              }
            }
          } catch (error) {
            console.error("Streaming error:", error);
            controller.enqueue(
              new TextEncoder().encode(
                JSON.stringify({ error: "Error during content generation" }) + "\n"
              )
            );
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
    } catch (aiError) {
      console.error("AI API error:", aiError);
      
      // Check if it's a rate limit error from Gemini
      if (aiError.message?.includes("exceeded your current quota") || 
          aiError.status === 429 || 
          (aiError.cause && aiError.cause.status === 429)) {
        return new Response(
          JSON.stringify({ 
            error: "AI service rate limit reached. Please try again later." 
          }),
          { 
            status: 429, 
            headers: { 
              "Content-Type": "application/json",
              "Retry-After": "60"
            } 
          }
        );
      }
      
      throw aiError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate content. " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}