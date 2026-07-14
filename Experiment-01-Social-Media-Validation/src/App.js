import React, { useState } from "react";
import "./App.css";

function App() {
  const [platform, setPlatform] = useState("Twitter");
  const [post, setPost] = useState("");

  const limits = {
    Twitter: 280,
    Facebook: 6320,
    Telegram: 409,
  };

  const currentLimit = limits[platform];
  const remaining = currentLimit - post.length;

  const getMessage = () => {
    if (post.length === 0) {
      return "Start typing your post...";
    }

    if (post.length > currentLimit) {
      return `❌ Character limit exceeded by ${
        post.length - currentLimit
      } characters.`;
    }

    return `✅ Valid post! ${remaining} characters remaining.`;
  };

  return (
    <div className="container">
      <h1>Social Media Validation</h1>

      <label>Select Platform</label>
      <select
        value={platform}
        onChange={(e) => setPlatform(e.target.value)}
      >
        <option>Twitter</option>
        <option>Facebook</option>
        <option>Telegram</option>
      </select>

      <br />
      <br />

      <textarea
        rows="8"
        placeholder="Write your post here..."
        value={post}
        onChange={(e) => setPost(e.target.value)}
      />

      <h3>
        Characters: {post.length} / {currentLimit}
      </h3>

      <p
        style={{
          color: post.length > currentLimit ? "red" : "green",
          fontWeight: "bold",
        }}
      >
        {getMessage()}
      </p>

      <button disabled={post.length > currentLimit || post.length === 0}>
        Publish Post
      </button>
    </div>
  );
}

export default App;