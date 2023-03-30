import { openNotification } from "@/app/layout/notification";
import { call, put, takeLatest } from "redux-saga/effects";
import services from "../../../services";
import { getCurrentChat, setCurrentChat } from "./action";

const handleGetCurrentChat = function* () {
  try {
    let { data } = yield call(services.Chat.getCurrentChat);
    yield put(setCurrentChat(data));
  } catch (error: any) {
    openNotification("error", error?.message);
  }
};

export default function* saga() {
  yield takeLatest(getCurrentChat, handleGetCurrentChat);
}
