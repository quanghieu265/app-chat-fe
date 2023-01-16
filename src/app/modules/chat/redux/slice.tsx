import { createSlice } from "@reduxjs/toolkit";
import { setCurrentChat } from "./action";

export interface ChatItem {
  chat_id?: number;
  users_id?: number[];
  content?: string;
  chat_name?: string;
  avatar?: string;
}

export interface MessageItem {
  chat_room_id?: number;
  content?: string;
  id?: number;
  reader?: number;
  sender?: number;
}

interface ChatState {
  currentChat: ChatItem[];
}

const initialState: ChatState = {
  currentChat: [],
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(setCurrentChat, (state, action) => {
      state.currentChat = action.payload;
    });
    builder.addDefaultCase((state) => {
      return state;
    });
  },
});

// Action creators are generated for each case reducer function
export default chatSlice.reducer;
