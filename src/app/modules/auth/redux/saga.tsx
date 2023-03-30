import { call, delay, put, takeLatest } from "redux-saga/effects";
import { openNotification } from "../../../layout/notification";
import services from "../../../services";
import {
  loginSaga,
  registerSaga,
  registerSagaSuccess,
  setAuthenticated
} from "./action";

const handleSignUp = function* (action: { payload: any }) {
  try {
    // call api to sign up
    yield call(services.Auth.createUser, action.payload);
    openNotification("success", "Create user successfully");
    yield delay(1000);
    yield put(registerSagaSuccess(true));
  } catch (error: any) {
    openNotification("error", error?.message);
  }
};

const handleLogin = function* (action: { payload: any }) {
  try {
    // call api to sign up
    let { data } = yield call(services.Auth.loginUser, action.payload);
    if (data) {
      localStorage.setItem("user", JSON.stringify(data));
      yield put(setAuthenticated(data));
    }
  } catch (error: any) {
    openNotification("error", error?.message);
  }
};

export default function* saga() {
  yield takeLatest(registerSaga, handleSignUp);
  yield takeLatest(loginSaga, handleLogin);
}
