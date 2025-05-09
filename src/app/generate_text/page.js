"use client";
import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import Link from "next/link";
import './gen.css';

export default function Home() {
  const [input, setInput] = useState("");
  const [quote, setQuote] = useState("Enter a prompt to generate a quote.");
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef(null);

  // Auto-reload when page is loaded
  useEffect(() => {
    // Reload only if coming from a different page (not initial load)
    const isNavigated = sessionStorage.getItem('navigated');
    if (isNavigated === 'true') {
      window.location.reload();
      sessionStorage.removeItem('navigated');
    } else {
      // Set flag for future navigation
      sessionStorage.setItem('pageLoaded', 'true');
    }
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput: input }),
        });
        
        const data = await response.json();
        if (response.ok) {
          setQuote(data.quote);
        } else {
          setQuote("Error: " + (data.error || "Could not fetch a quote"));
        }
      } catch (error) {
        setQuote("Error: Could not fetch a quote at this time.");
      } finally {
        setIsLoading(false);
        setInput(""); // Clear the input field
      }
    } else {
      alert("Please enter some text.");
    }
  };

  // Auto-scroll to the latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [quote]);

  // When navigating away, set the navigated flag
  const handleNavigation = () => {
    sessionStorage.setItem('navigated', 'true');
  };

  return (
    <div className="layout-container">
      <div className="header-container">
        <h1>Qoute Generator</h1>
        <Link href="/" className="home-button" onClick={handleNavigation}>HOME</Link>
      </div>
      <main>
        {/* Quote Display */}
        <div className="quote-container" ref={chatContainerRef}>
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
            disabled={isLoading}
          />
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              "..." // Or a loading spinner
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}