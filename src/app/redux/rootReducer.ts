import { combineReducers } from "@reduxjs/toolkit";
import { all, fork } from "redux-saga/effects";
import { reducer as authSlice, saga as authSaga } from "../modules/auth/redux";
import { reducer as chatSlice, saga as chatSaga } from "../modules/chat/redux";
export const rootReducer = combineReducers({
  auth: authSlice,
  chat: chatSlice,
});

export function* rootSaga() {
  yield all([fork(authSaga), fork(chatSaga)]);
}
