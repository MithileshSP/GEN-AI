"use client";  // Ensures this code runs client-side in Next.js

import { useState, useEffect, useRef } from "react";  // React hooks for state management and side effects
import { handleGenerateProject } from "../api/genobj/route";  // Import the function that generates project guidance
import Markdown from "react-markdown";  // To render markdown-formatted text in the project instructions
import './ge.css'
import { DIRTY } from "zod";
export default function Home() {
  // Step 1: Define React state variables
  const [input, setInput] = useState("");  // Store the user's input (project idea or concept)
  const [projectData, setProjectData] = useState({
    projectTitle: "Enter a project idea to get started.",
    breakdownSteps: [],
    nextAction: "",
  });  // Store the project data including steps, code, and next action
  const chatContainerRef = useRef(null);  // Reference to allow auto-scrolling to the bottom of the chat container

  /**
   * Handle form submission event.
   * This function is triggered when the user submits the form.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();  // Prevent the default form submission behavior
    if (input) {  // Ensure the user has entered a project idea
      // Step 2: Generate project guide based on user input
      const generatedProject = await handleGenerateProject(input);

      // Step 3: Update the state with the generated project data
      setProjectData(generatedProject || {
        projectTitle: "Error: Could not generate a project guide.",
        breakdownSteps: [],
        nextAction: ""
      });
      setInput("");  // Clear the input field after submission
    } else {
      alert("Please enter a project idea.");  // Alert if the input is empty
    }
  };

  // Step 4: Auto-scroll to the bottom of the page when the project data updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [projectData]);  // Trigger auto-scrolling when `projectData` updates

  return (
    
    <div className="layout-container">
      <div id="proj"><h1>PROJIN</h1></div>
      <main>
        {/* Step 5: Display the generated project guide */}
        <div className="project-container">
          <h2>{projectData.projectTitle}</h2>  {/* Display the project title */}
          <div className="project-steps">
            {projectData.breakdownSteps.map((step, index) => (
              <div key={index} className="project-step">
                <h3>{step.stepTitle}</h3>  {/* Display the step title */}
                <Markdown>{step.stepDescription}</Markdown>  {/* Render the step description */}
                {step.codeSnippet && (
                  <div className="code-snippet">
                    <h4>Code Example:</h4>
                    <pre>{step.codeSnippet}</pre>  {/* Render the optional code snippet */}
                  </div>
                )}
                {step.resources && (
                  <div className="resources">
                    <h4>Helpful Resources:</h4>
                    <p>{step.resources}</p>  {/* Render any resources or links */}
                  </div>
                )}
              </div>
            ))}
          </div>
          {projectData.nextAction && (
            <div className="next-action">
              <h3>Next Action:</h3>
              <p>{projectData.nextAction}</p>  {/* Render the next action to take after completing the project */}
            </div>
          )}
        </div>

        {/* Step 6: Input form for the user to enter a project idea */}
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}  // Update state when user types
            placeholder="Type a project idea to get started..."
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

