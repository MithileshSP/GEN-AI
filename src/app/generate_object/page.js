"use client";

import { useState, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import './ge.css';

export default function Home() {
  // State variables
  const [input, setInput] = useState("");
  const [projectData, setProjectData] = useState({
    projectTitle: "Enter a project idea to get started.",
    breakdownSteps: [],
    nextAction: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  /**
   * Handle form submission to generate project guide
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/genobj', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userInput: input }),
        });
        
        const data = await response.json();
        if (response.ok) {
          setProjectData(data.projectData);
        } else {
          setProjectData({
            projectTitle: "Error: " + (data.error || "Could not generate a project guide."),
            breakdownSteps: [],
            nextAction: "",
          });
        }
      } catch (error) {
        console.error("Error fetching project guide:", error);
        setProjectData({
          projectTitle: "Error: Could not generate a project guide.",
          breakdownSteps: [],
          nextAction: "",
        });
      } finally {
        setIsLoading(false);
        setInput("");
      }
    } else {
      alert("Please enter a project idea.");
    }
  };

  // Auto-scroll to the bottom when project data updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [projectData]);

  return (
    <div className="layout-container">
      <div id="proj"><h1>PROJIN</h1></div>
      <main>
        {/* Display the generated project guide */}
        <div className="project-container" ref={chatContainerRef}>
          <h2>{projectData.projectTitle}</h2>
          <div className="project-steps">
            {projectData.breakdownSteps.map((step, index) => (
              <div key={index} className="project-step">
                <h3>{step.stepTitle}</h3>
                <Markdown>{step.stepDescription}</Markdown>
                {step.codeSnippet && (
                  <div className="code-snippet">
                    <h4>Code Example:</h4>
                    <pre>{step.codeSnippet}</pre>
                  </div>
                )}
                {step.resources && (
                  <div className="resources">
                    <h4>Helpful Resources:</h4>
                    <p>{step.resources}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          {projectData.nextAction && (
            <div className="next-action">
              <h3>Next Action:</h3>
              <p>{projectData.nextAction}</p>
            </div>
          )}
        </div>

        {/* Input form for project ideas */}
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a project idea to get started..."
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