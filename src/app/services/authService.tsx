import { openNotification } from "../layout/notification";
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

  async searchUsers(params: { username: string }): Promise<any> {
    let api = `/user/search`;
    let response = await axiosInstance.get(api, { params });
    return response;
  },

  async refreshAccessToken(): Promise<any> {
    let api = `/user/refresh`;
    let response = await axiosInstance.get(api);
    return response;
  },

  async updateUser(id: number, data: any): Promise<any> {
    try {
      let api = `/user/${id}`;
      let response = await axiosInstance.put(api, data);
      return response;
    } catch (error: any) {
      openNotification("error", error.message);
    }
  }
};

export default services;
