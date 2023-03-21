import { createSlice } from "@reduxjs/toolkit";
import {
  setAuthenticated,
  removeAuthenticated,
  registerSagaSuccess,
  setFriendList
} from "./action";

const checkAuthenticated = () => {
  const user: any = localStorage.getItem("user");
  const checkJson = user ? JSON.parse(user) : null;
  return !!(checkJson != null && checkJson?.token);
};

const checkUser = () => {
  const user: any = localStorage.getItem("user");
  const checkJson = user ? JSON.parse(user) : {};
  return checkJson;
};

export interface IUser {
  id?: number;
  username?: string;
  email?: string;
  token?: string;
  friends_id?: IUser[];
}

export interface AuthState {
  isRegister: boolean;
  isAuthenticated: boolean;
  user: IUser;
}

const initialState: AuthState = {
  isRegister: false,
  isAuthenticated: checkAuthenticated(),
  user: checkUser()
};

export const authSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(setAuthenticated, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    });
    builder.addCase(removeAuthenticated, state => {
      state.isAuthenticated = false;
      state.user = {};
    });
    builder.addCase(registerSagaSuccess, (state, action) => {
      state.isRegister = action.payload;
    });
    builder.addCase(setFriendList, (state, action) => {
      state.user = { ...state.user, friends_id: action.payload };
    });

    builder.addDefaultCase(state => {
      return state;
    });
  }
});

// Action creators are generated for each case reducer function
export default authSlice.reducer;
