import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  platform: "Instagram",
  posts: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    addPost: (state, action) => {
      state.posts.push({
        id: Date.now(),
        text: action.payload,
      });
    },

    changePlatform: (state, action) => {
      state.platform = action.payload;
    },
  },
});

export const { addPost, changePlatform } = postsSlice.actions;

export default postsSlice.reducer;