import {
  configureStore
} from "@reduxjs/toolkit";

import authReducer
  from "./features/authSlice";

import contentReducer
  from "./features/contentSlice";

export const store =
  configureStore({

    reducer: {

      auth: authReducer,

      content:
        contentReducer

    }

  });