"use client";
import { useState, useEffect, useRef } from "react";
import { handleGenerateText } from "../api/completion/route"; // Import the action for handling text generation
import Markdown from "react-markdown";
import './gen.css'

export default function Home() {
  const [input, setInput] = useState("");
  const [quote, setQuote] = useState("Enter a prompt to generate a quote.");

  const chatContainerRef = useRef(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input) {
      const userMessage = { role: "user", content: input };
      const generatedQuote = await handleGenerateText(input);
      const aiMessage = {
        role: "ai",
        content:
          generatedQuote || "Error: Could not fetch response from Gemini AI.",
      };

      setQuote(generatedQuote);
      setInput(""); // Clear the input field
    } else {
      alert("Please enter some text.");
    }
  };

  // Auto-scroll to the latest message (optional if keeping chat history)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [quote]); // Trigger scroll when the quote changes

  return (
    <div className="layout-container">
      <main>
        {/* Quote Display */}
        <div className="quote-container">
          <div className="quote">
            <Markdown>{quote}</Markdown>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a topic to generate a quote..."
            className="input-field"
          />
          <button type="submit" className="submit-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </form>
      </main>
    </div>
  );
}
