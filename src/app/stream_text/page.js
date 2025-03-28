"use client";

import { useChat } from "ai/react";
import Markdown from "react-markdown";
import { useEffect, useRef } from "react";
import "./st.css";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    systemMessage: `You are a Python programming assistant. Your task is to respond only with Python code to the user's prompts.`,
  });

  const chatContainerRef = useRef(null);

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

  return (
    <div className="layout-container">
      <header className="header">
        <h1 className="heading">Python Code Generator</h1>
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
