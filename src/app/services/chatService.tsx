import axios from "axios";

const requestHeader = {
  Accept: "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers":
    "Origin,Authorization,Content-Type,Accept,User-Agent,Cache-Control,Keep-Alive,X-Requested-With,If-Modified-Since",
};

const axiosConfig = {
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : process.env.REACT_APP_BACKEND_URL + "/api",
  header: requestHeader,
};

const authInstance = axios.create(axiosConfig);

const makeHeader = (customConfig?: any, additionToken: string = "") => {
  let user = localStorage.getItem("user");

  if (!user) {
    return {
      headers: {},
    };
  }

  let { token } = JSON.parse(user);

  let config: any = {
    headers: {
      Authorization: "Bearer " + token,
    },
  };
  if (additionToken) {
    config.headers["x-access-token"] = additionToken;
  }

  if (customConfig !== undefined && customConfig && !customConfig.headers)
    config = {
      ...config,
      ...customConfig,
    };

  return config;
};

const services = {
  async addUserToChat(data: { id: number }): Promise<any> {
    let config = makeHeader();
    let api = `/chat/addusers`;
    let response = await authInstance.post(api, data, config);
    return response;
  },

  async getCurrentChat(): Promise<any> {
    let config = makeHeader();
    let api = `/chat`;
    let response = await authInstance.get(api, config);
    return response;
  },

  async getCurrentMessage(data: { id: number; size: number }): Promise<any> {
    let config = makeHeader();
    let api = `/chat/message/${data.id}?size=${data.size}`;
    let response = await authInstance.get(api, config);
    return response;
  },

  async addNewMessage(data: {
    chatId?: string;
    message?: string;
    usersId?: number[];
  }): Promise<any> {
    let config = makeHeader();
    let api = `/chat/message/`;
    let response = await authInstance.post(api, data, config);
    return response;
  },

  async deleteChatById(data: { id?: number }): Promise<any> {
    let config = makeHeader();
    let api = `/chat/${data.id}`;
    let response = await authInstance.delete(api, config);
    return response;
  },
};

export default services;
