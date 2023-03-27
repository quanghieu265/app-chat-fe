import { openNotification } from "../layout/notification";
import axiosInstance from "./axios";

const services = {
  async addNewBlog(data: { title: string; content: string }): Promise<any> {
    try {
      let api = `/blog/add`;
      let response = await axiosInstance.post(api, data);
      return response;
    } catch (error: any) {
      return openNotification("error", error.message);
    }
  },

  async getBlogs(username: string): Promise<any> {
    try {
      let api = `/blog/${username}`;
      let response = await axiosInstance.get(api);
      return response;
    } catch (error: any) {
      return openNotification("error", error.message);
    }
  },

  async deleteBlogById(id: string): Promise<any> {
    try {
      let api = `/blog/${id}`;
      let response = await axiosInstance.delete(api);
      return response;
    } catch (error: any) {
      return openNotification("error", error.message);
    }
  }
};

export default services;
