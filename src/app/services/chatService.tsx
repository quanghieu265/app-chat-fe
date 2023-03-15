import { IMessage } from "../helper/type";
import axiosInstance from "./axios";

const services = {
  async addUserToChat(data: { id: number }): Promise<any> {
    let api = `/chat/addusers`;
    let response = await axiosInstance.post(api, data);
    return response;
  },

  async getCurrentChat(): Promise<any> {
    let api = `/chat`;
    let response = await axiosInstance.get(api);
    return response;
  },

  async updateUserNoticeChatById(data: any): Promise<any> {
    let api = `/chat/${data.chat_room_id}`;
    let response = await axiosInstance.put(api, data);
    return response;
  },

  async getCurrentMessage(data: { id: number; size: number }): Promise<any> {
    let api = `/chat/message/${data.id}?size=${data.size}`;
    let response = await axiosInstance.get(api);
    return response;
  },

  async addNewMessage(data: {
    chatId?: string;
    message?: IMessage[];
    usersId?: number[];
  }): Promise<any> {
    let api = `/chat/message`;
    let response = await axiosInstance.post(api, data);
    return response;
  },

  async deleteChatById(data: { id?: number }): Promise<any> {
    let api = `/chat/${data.id}`;
    let response = await axiosInstance.delete(api);
    return response;
  }
};

export default services;
