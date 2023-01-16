import { createAction } from "@reduxjs/toolkit";

export const getCurrentChat = createAction("GET_CURRENT_CHAT");

export const setCurrentChat = createAction("SET_CURRENT_CHAT", (payload) => {
  return { payload };
});

// export const getCurrentMessage = createAction(
//   "GET_CURRENT_MESSAGES",
//   (payload) => {
//     return { payload };
//   }
// );
