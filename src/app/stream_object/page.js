'use client';

import { useState, useEffect } from "react";
import "./page.css";

export default function ContentCreatorAssistant() {
  const [platform, setPlatform] = useState("Instagram");
  const [topic, setTopic] = useState("");
  const [contentInfo, setContentInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryInfo, setRetryInfo] = useState({ isRetrying: false, countdown: 0 });

  // Countdown effect for retry
  useEffect(() => {
    let interval;
    if (retryInfo.isRetrying && retryInfo.countdown > 0) {
      interval = setInterval(() => {
        setRetryInfo(prev => ({
          ...prev,
          countdown: prev.countdown - 1
        }));
      }, 1000);
    } else if (retryInfo.isRetrying && retryInfo.countdown === 0) {
      fetchContentInfo();
      setRetryInfo({ isRetrying: false, countdown: 0 });
    }
    
    return () => clearInterval(interval);
  }, [retryInfo]);

  const fetchContentInfo = async (e) => {
    if (e) e.preventDefault();
    
    if (!retryInfo.isRetrying) {
      setLoading(true);
      setContentInfo([]); // Clear previous data
      setError(""); // Clear previous errors
    }

    try {
      const res = await fetch("/api/streamobj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, topic }),
      });

      // Handle rate limiting
      if (res.status === 429) {
        const retryAfter = res.headers.get('Retry-After') || '60';
        const secondsToWait = parseInt(retryAfter, 10);
        
        setError(`Rate limit reached. Please wait ${secondsToWait} seconds before trying again.`);
        setRetryInfo({ 
          isRetrying: true, 
          countdown: secondsToWait 
        });
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      
      // Map to keep track of content items by their index
      const contentMap = new Map();
      let nextIndex = 0;

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
              
              // Check if the chunk contains an error message
              if (jsonChunk.error) {
                setError(`Error: ${jsonChunk.error}`);
              } else {
                // Store or update the item in our map
                // Each complete object from the stream will be a new content item
                if (!contentMap.has(nextIndex)) {
                  contentMap.set(nextIndex, jsonChunk);
                  nextIndex++;
                }
                
                // Update contentInfo state with all valid items from the map
                setContentInfo(Array.from(contentMap.values()).filter(item => 
                  item.platform && item.caption && item.hashtags && item.mediaSuggestion
                ));
              }
            } catch (parseError) {
              console.error("Error parsing JSON chunk:", line, parseError);
            }
          }
        }
      }

      if (result.trim()) {
        try {
          const finalChunk = JSON.parse(result);
          
          // Check if the final chunk contains an error message
          if (finalChunk.error) {
            setError(`Error: ${finalChunk.error}`);
          } else {
            // Add the final chunk to our map
            if (!contentMap.has(nextIndex)) {
              contentMap.set(nextIndex, finalChunk);
            }
            
            // Final update to contentInfo state with all valid items
            setContentInfo(Array.from(contentMap.values()).filter(item => 
              item.platform && item.caption && item.hashtags && item.mediaSuggestion
            ));
          }
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

  const handleCancel = () => {
    setRetryInfo({ isRetrying: false, countdown: 0 });
    setLoading(false);
    setError("Retry canceled.");
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
            disabled={loading || retryInfo.isRetrying}
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
            disabled={loading || retryInfo.isRetrying}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !topic || retryInfo.isRetrying}
        >
          {loading ? "Generating..." : "Generate Content"}
        </button>
        
        {retryInfo.isRetrying && (
          <button 
            type="button" 
            onClick={handleCancel}
            className="cancel-button"
          >
            Cancel Retry
          </button>
        )}
      </form>
      
      {error && <p className="error">{error}</p>}
      
      {retryInfo.isRetrying && (
        <p className="retry-info">
          Retrying in {retryInfo.countdown} seconds...
        </p>
      )}
      
      {loading && !retryInfo.isRetrying && (
        <p className="loading">Generating content ideas...</p>
      )}
      
      <div className="content-container">
        {contentInfo.length > 0 && (
          <div>
            <h2>Generated Content:</h2>
            {contentInfo.map((info, index) => (
              <div key={index} className="content-item">
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