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

  async getBlogs(id: number): Promise<any> {
    let api = `/blog/${id}`;
    let response = await axiosInstance.get(api);
    return response;
  }
};

export default services;
