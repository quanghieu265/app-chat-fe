import { createAction } from "@reduxjs/toolkit";

export const setAuthenticated = createAction("SET_AUTHENTICATED", (payload) => {
  return { payload };
});

export const removeAuthenticated = createAction("REMOVE_AUTHENTICATED");

export const registerSaga = createAction("REGISTER_SAGA", (payload) => {
  return { payload };
});
export const registerSagaSuccess = createAction(
  "REGISTER_SAGA_SUCCESS",
  (payload) => {
    return { payload };
  }
);

export const loginSaga = createAction("LOGIN_SAGA", (payload) => {
  return { payload };
});
