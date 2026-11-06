import {
  createSlice,
  createAsyncThunk
} from "@reduxjs/toolkit";

import {
  apiRequest
} from "../api";

export const fetchContent =
  createAsyncThunk(
    "content/fetch",

    async (
      _,
      { rejectWithValue }
    ) => {

      try {

        return await apiRequest(
          "/content"
        );

      } catch (error) {

        return rejectWithValue(
          error.message
        );
      }
    }
  );

export const saveContent =
  createAsyncThunk(
    "content/save",

    async (
      content,
      { rejectWithValue }
    ) => {

      try {

        return await apiRequest(
          "/content",
          {
            method: "PUT",

            body:
              JSON.stringify(
                content
              )
          }
        );

      } catch (error) {

        return rejectWithValue(
          error.message
        );
      }
    }
  );

const contentSlice =
  createSlice({

    name: "content",

    initialState: {

      data: null,

      loading: false,

      saving: false,

      error: null
    },

    reducers: {},

    extraReducers:
      builder => {

        builder

          .addCase(
            fetchContent.pending,
            state => {

              state.loading =
                true;
            }
          )

          .addCase(
            fetchContent.fulfilled,
            (
              state,
              action
            ) => {

              state.loading =
                false;

              state.data =
                action.payload;
            }
          )

          .addCase(
            fetchContent.rejected,
            (
              state,
              action
            ) => {

              state.loading =
                false;

              state.error =
                action.payload;
            }
          )

          .addCase(
            saveContent.pending,
            state => {

              state.saving =
                true;
            }
          )

          .addCase(
            saveContent.fulfilled,
            (
              state,
              action
            ) => {

              state.saving =
                false;

              state.data =
                action.payload.content;
            }
          )

          .addCase(
            saveContent.rejected,
            (
              state,
              action
            ) => {

              state.saving =
                false;

              state.error =
                action.payload;
            }
          );
      }
  });

export default
  contentSlice.reducer;