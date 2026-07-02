import axiosInstance from "./axiosInstance";




export const getMyChats = () => axiosInstance.get("/chats/my");


export const getChatById = (chatId) => axiosInstance.get(`/chats/${chatId}`);




export const getMessages = (chatId, page = 1, limit = 30) =>
  axiosInstance.get(`/messages/${chatId}`, { params: { page, limit } });


export const sendMessage = (chatId, text) =>
  axiosInstance.post("/messages", { chatId, text });


export const markMessageRead = (messageId) =>
  axiosInstance.put(`/messages/read/${messageId}`);


export const deleteMessage = (messageId) =>
  axiosInstance.delete(`/messages/${messageId}`);
