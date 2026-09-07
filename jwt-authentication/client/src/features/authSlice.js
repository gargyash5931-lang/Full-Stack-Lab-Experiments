import {
  createSlice,
  createAsyncThunk
} from "@reduxjs/toolkit";

import {
  apiRequest
} from "../api";

/* LOGIN */

export const login =
  createAsyncThunk(
    "auth/login",

    async (
      { username, password },
      { rejectWithValue }
    ) => {

      try {

        return await apiRequest(
          "/auth/login",
          {
            method: "POST",

            body:
              JSON.stringify({
                username,
                password
              })
          }
        );

      } catch (error) {

        return rejectWithValue(
          error.message
        );
      }
    }
  );

/* REGISTER */

export const register =
  createAsyncThunk(
    "auth/register",

    async (
      data,
      { rejectWithValue }
    ) => {

      try {

        return await apiRequest(
          "/auth/register",
          {
            method: "POST",

            body:
              JSON.stringify(data)
          }
        );

      } catch (error) {

        return rejectWithValue(
          error.message
        );
      }
    }
  );

/* PROFILE */

export const updateProfile =
  createAsyncThunk(
    "auth/profile",

    async (
      data,
      { rejectWithValue }
    ) => {

      try {

        return await apiRequest(
          "/auth/profile",
          {
            method: "PUT",

            body:
              JSON.stringify(data)
          }
        );

      } catch (error) {

        return rejectWithValue(
          error.message
        );
      }
    }
  );

/* PASSWORD */

export const changePassword =
  createAsyncThunk(
    "auth/password",

    async (
      data,
      { rejectWithValue }
    ) => {

      try {

        return await apiRequest(
          "/auth/password",
          {
            method: "PUT",

            body:
              JSON.stringify(data)
          }
        );

      } catch (error) {

        return rejectWithValue(
          error.message
        );
      }
    }
  );

/* CURRENT USER */

export const loadMe =
  createAsyncThunk(
    "auth/me",

    async (
      _,
      { rejectWithValue }
    ) => {

      try {

        return await apiRequest(
          "/auth/me"
        );

      } catch (error) {

        return rejectWithValue(
          error.message
        );
      }
    }
  );

const savedUser =
  localStorage.getItem(
    "user"
  );

const initialState = {

  user:
    savedUser
      ? JSON.parse(savedUser)
      : null,

  token:
    localStorage.getItem(
      "token"
    ),

  loading: false,

  error: null
};

const authSlice =
  createSlice({

    name: "auth",

    initialState,

    reducers: {

      logout(state) {

        state.user =
          null;

        state.token =
          null;

        state.error =
          null;

        localStorage.removeItem(
          "user"
        );

        localStorage.removeItem(
          "token"
        );
      }
    },

    extraReducers:
      builder => {

        builder

          .addCase(
            login.pending,
            state => {

              state.loading =
                true;

              state.error =
                null;
            }
          )

          .addCase(
            login.fulfilled,
            (
              state,
              action
            ) => {

              state.loading =
                false;

              state.user =
                action.payload.user;

              state.token =
                action.payload.token;

              localStorage.setItem(
                "user",
                JSON.stringify(
                  action.payload.user
                )
              );

              localStorage.setItem(
                "token",
                action.payload.token
              );
            }
          )

          .addCase(
            login.rejected,
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
            register.fulfilled,
            (
              state,
              action
            ) => {

              state.user =
                action.payload.user;

              state.token =
                action.payload.token;

              localStorage.setItem(
                "user",
                JSON.stringify(
                  action.payload.user
                )
              );

              localStorage.setItem(
                "token",
                action.payload.token
              );
            }
          )

          .addCase(
            register.rejected,
            (
              state,
              action
            ) => {

              state.error =
                action.payload;
            }
          )

          .addCase(
            updateProfile.fulfilled,
            (
              state,
              action
            ) => {

              state.user =
                action.payload.user;

              localStorage.setItem(
                "user",
                JSON.stringify(
                  action.payload.user
                )
              );
            }
          )

          .addCase(
            loadMe.fulfilled,
            (
              state,
              action
            ) => {

              state.user =
                action.payload.user;

              localStorage.setItem(
                "user",
                JSON.stringify(
                  action.payload.user
                )
              );
            }
          )

          .addCase(
            loadMe.rejected,
            state => {

              state.user =
                null;

              state.token =
                null;

              localStorage.removeItem(
                "user"
              );

              localStorage.removeItem(
                "token"
              );
            }
          );
      }
  });

export const {
  logout
} =
  authSlice.actions;

export default
  authSlice.reducer;