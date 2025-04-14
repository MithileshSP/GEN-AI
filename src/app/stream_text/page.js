"use client";

import { useChat } from "ai/react";
import Markdown from "react-markdown";
import { useEffect, useRef } from "react";
import Link from "next/link";
import "./st.css";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    systemMessage: `You are a Python programming assistant. Your task is to respond only with Python code to the user's prompts.`,
  });

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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Debugging: Log messages
  useEffect(() => {
    console.log("Messages updated:", messages);
  }, [messages]);

  // 🛠️ Handle submit manually before sending
  const handleCustomSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) {
      alert("Please enter a prompt!");
      return;
    }

    // Debugging: Check messages before sending
    console.log("Submitting message:", input);

    // Call `handleSubmit` from useChat
    handleSubmit(e);
  };

  // When navigating away, set the navigated flag
  const handleNavigation = () => {
    sessionStorage.setItem('navigated', 'true');
  };

  return (
    <div className="layout-container">
      <header className="header">
        <div className="header-container">
          <h1 className="heading">Python Code Generator</h1>
          <Link href="/" className="home-button" onClick={handleNavigation}>HOME</Link>
        </div>
      </header>
      <div className="chat-container flex flex-col w-full max-w-md mx-auto stretch" ref={chatContainerRef}>
        {messages && Array.isArray(messages) && messages.map((m) => (
          <div key={m.id} className={`chat-message ${m.role === "user" ? "user" : "python-bot"}`}>
            <Markdown>{m.content}</Markdown>
          </div>
        ))}
        <form onSubmit={handleCustomSubmit} className="form-container">
          <input
            className="chat-input"
            value={input}
            placeholder="Ask for Python code..."
            onChange={handleInputChange}
          />
          <button type="submit" className="chat-submit-button">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}