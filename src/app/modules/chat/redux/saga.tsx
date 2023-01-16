import { call, put, takeLatest } from "redux-saga/effects";
import { openNotification } from "../../../layout/notification";
import services from "../../../services";
import { getCurrentChat, setCurrentChat } from "./action";

const handleGetCurrentChat = function* () {
  try {
    // call api to sign up
    let { data } = yield call(services.Chat.getCurrentChat);
    yield put(setCurrentChat(data));
  } catch (error: any) {
    const { response } = error;
    openNotification("error", response.data.message);
  }
};

export default function* saga() {
  yield takeLatest(getCurrentChat, handleGetCurrentChat);
}
