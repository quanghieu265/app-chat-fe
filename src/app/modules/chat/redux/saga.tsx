import { call, put, takeLatest } from "redux-saga/effects";
import { openNotification } from "../../../layout/notification";
import services from "../../../services";
import { getCurrentChat, setCurrentChat, updateCurrentChat } from "./action";

const handleGetCurrentChat = function* () {
  try {
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
