import axiosInstance from "./axios";

const services = {
  async createUser(data: any): Promise<any> {
    let api = `/user/signup`;
    let response = await axiosInstance.post(api, data);
    return response;
  },

  async loginUser(data: any): Promise<any> {
    let api = `/user/login`;
    let response = await axiosInstance.post(api, data);
    return response;
  },

  async logoutUser(): Promise<any> {
    let api = `/user/logout`;
    let response = await axiosInstance.post(api);
    return response;
  },

  async getUser(): Promise<any> {
    let api = `/user`;
    let response = await axiosInstance.get(api);
    return response;
  },

  async refreshAccessToken(): Promise<any> {
    let api = `/user/refresh`;
    let response = await axiosInstance.get(api);
    return response;
  }
};

export default services;
