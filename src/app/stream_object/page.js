'use client';

import { useState } from "react";
import "../stream_object/page.css"
export default function ContentCreatorAssistant() {
  const [platform, setPlatform] = useState("Instagram");
  const [topic, setTopic] = useState("");
  const [contentInfo, setContentInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchContentInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setContentInfo([]); // Clear previous data
    setError(""); // Clear previous errors

    try {
      const res = await fetch("/app/api/streamobj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, topic }),
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        result += decoder.decode(value, { stream: true });

        const lines = result.split("\n");
        result = lines.pop(); // Keep the last incomplete line for the next loop

        for (const line of lines) {
          if (line.trim()) {
            try {
              const jsonChunk = JSON.parse(line);
              setContentInfo([jsonChunk]);
            } catch (parseError) {
              console.error("Error parsing JSON chunk:", line, parseError);
            }
          }
        }
      }

      if (result.trim()) {
        try {
          const finalChunk = JSON.parse(result);
          setContentInfo([finalChunk]);
        } catch (parseError) {
          console.error("Error parsing remaining JSON fragment:", result, parseError);
        }
      }
    } catch (error) {
      setError(`Error: ${error.message}`);
      console.error("Error fetching content information:", error);
    } finally {
      setLoading(false);


      
    }
  };

  return (
    <div className="container">
      <h1>Content Creator Assistant</h1>
      <form onSubmit={fetchContentInfo}>
        <div>
          <label htmlFor="platform">Choose a Platform:</label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            <option value="Instagram">Instagram</option>
            <option value="TikTok">TikTok</option>
            <option value="Twitter">Twitter</option>
            <option value="YouTube">YouTube</option>
          </select>
        </div>
        <div>
          <label htmlFor="topic">Enter a Topic:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter a topic"
            required
          />
        </div>
        <button type="submit" disabled={loading || !topic}>
          {loading ? "Generating..." : "Generate Content"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Loading content information...</p>}
      <div className="content-container">
        {contentInfo.length > 0 && (
          <div>
            <h2>Generated Content:</h2>
            {contentInfo.map((info, index) => (
              <div key={index}>
                <p><strong>Platform:</strong> {info.platform}</p>
                <p><strong>Caption:</strong> {info.caption}</p>
                <p><strong>Hashtags:</strong> {info.hashtags}</p>
                <p><strong>Media Suggestion:</strong> {info.mediaSuggestion}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
