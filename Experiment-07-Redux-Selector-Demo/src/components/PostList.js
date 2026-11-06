import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addPost, changePlatform } from "../features/postsSlice";
import { totalPosts, allPosts } from "../selectors/postSelectors";

function PostList() {
  const dispatch = useDispatch();

  const posts = useSelector(allPosts);
  const count = useSelector(totalPosts);
  const platform = useSelector((state) => state.posts.platform);

  const [text, setText] = useState("");

  const handleAdd = () => {
    if (text.trim() === "") return;

    dispatch(addPost(text));
    setText("");
  };

  return (
    <div className="container">
      <h1>📱 Redux Toolkit Social Dashboard</h1>

      <h3>Select Platform</h3>

      <select
        value={platform}
        onChange={(e) => dispatch(changePlatform(e.target.value))}
      >
        <option>Instagram</option>
        <option>Facebook</option>
        <option>Twitter</option>
        <option>LinkedIn</option>
      </select>

      <h3>Create a New Post</h3>

      <div className="inputBox">
        <input
          type="text"
          placeholder="What's on your mind?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={handleAdd}>Add Post</button>
      </div>

      <h3>Your Posts</h3>

      {posts.length === 0 ? (
        <p style={{ textAlign: "center" }}>No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div className="post" key={post.id}>
            {post.text}
          </div>
        ))
      )}

      <div className="total">Total Posts : {count}</div>
    </div>
  );
}

export default PostList;