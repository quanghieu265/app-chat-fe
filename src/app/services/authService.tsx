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
  baseURL: "http://localhost:5000/api",
  header: requestHeader,
};

const authInstance = axios.create(axiosConfig);

if (user) {
  let { token } = JSON.parse(user);
  authInstance.defaults.headers.common["Authorization"] = "Bearer " + token;
}

const services = {
  async createUser(data: any): Promise<any> {
    let api = `/user/signup`;
    let response = await authInstance.post(api, data);
    return response;
  },

  async loginUser(data: any): Promise<any> {
    let api = `/user/login`;
    let response = await authInstance.post(api, data);
    return response;
  },

  async getUser(): Promise<any> {
    let api = `/user`;
    let response = await authInstance.get(api);
    return response;
  },
};

export default services;