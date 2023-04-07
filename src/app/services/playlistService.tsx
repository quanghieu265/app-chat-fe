import { openNotification } from "../layout/notification";
import axiosInstance from "./axios";

const services = {
  async addNewVideoToPlaylist(data: {
    title: string;
    description: string;
    thumbUrl: string;
    videoUrl: string;
  }): Promise<any> {
    try {
      let api = `/playlist`;
      let response = await axiosInstance.post(api, data);
      return response;
    } catch (error: any) {
      return openNotification("error", error.message);
    }
  },

  async getPlaylistByUser(username: string): Promise<any> {
    try {
      let api = `/playlist/${username}`;
      let response = await axiosInstance.get(api);
      return response;
    } catch (error: any) {
      return openNotification("error", error.message);
    }
  },

  async deleteVideoById(id: string): Promise<any> {
    try {
      let api = `/playlist/${id}`;
      let response = await axiosInstance.delete(api);
      return response;
    } catch (error: any) {
      return openNotification("error", error.message);
    }
  }
};

export default services;
