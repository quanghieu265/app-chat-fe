import axios from "axios";

let user = localStorage.getItem("user");

const requestHeader = {
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Origin,Authorization,Content-Type,Accept,User-Agent,Cache-Control,Keep-Alive,X-Requested-With,If-Modified-Since",
};

const axiosConfig = {
  baseURL: process.env.REACT_APP_BACKEND_URL + "/api",
  header: requestHeader,
};

const authInstance = axios.create(axiosConfig);

if (user) {
  let { token } = JSON.parse(user);
  authInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
}

const services = {
  async addUserToChat(data: { id: number }): Promise<any> {
    let api = `/chat/addusers`;
    let response = await authInstance.post(api, data);
    return response;
  },

  async getCurrentChat(): Promise<any> {
    let api = `/chat`;
    let response = await authInstance.get(api);
    return response;
  },

  async getCurrentMessage(data: { id: number; size: number }): Promise<any> {
    let api = `/chat/message/${data.id}?size=${data.size}`;
    let response = await authInstance.get(api);
    return response;
  },

  async addNewMessage(data: {
    chatId?: string;
    message?: string;
    usersId?: number[];
  }): Promise<any> {
    let api = `/chat/message/`;
    let response = await authInstance.post(api, data);
    return response;
  },

  async deleteChatById(data: { id?: number }): Promise<any> {
    let api = `/chat/${data.id}`;
    let response = await authInstance.delete(api);
    return response;
  },
};

export default services;
