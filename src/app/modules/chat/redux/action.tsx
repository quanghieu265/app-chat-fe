import { createAction } from "@reduxjs/toolkit";

export const getCurrentChat = createAction("GET_CURRENT_CHAT");

export const setCurrentChat = createAction("SET_CURRENT_CHAT", (payload) => {
  return { payload };
});

export const updateCurrentChat = createAction(
  "UPDATE_CURRENT_CHAT",
  (payload) => {
    return { payload };
  }
);
