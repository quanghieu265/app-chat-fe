import { storageFB } from "@/firebase/index";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import {
  Avatar,
  Button,
  Card,
  Input,
  Skeleton,
  Tooltip,
  Upload,
  UploadFile,
} from "antd";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import io, { Socket } from "socket.io-client";
import { openNotification } from "src/app/layout/notification";
import { RootState } from "src/app/redux/store";
import services from "src/app/services";
import { setCurrentChat } from "./../../redux/action";
import { ChatItem, MessageItem } from "./../../redux/slice";

import type { UploadProps } from "antd";

const { Meta } = Card;
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
let size = 15;
let total = 0;
let SelectedChatUserId: number | undefined;

const MessageList: React.FC = () => {
  const _ = require("lodash");
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const allChat = useSelector((state: RootState) => state.chat.currentChat);
  const { chatId } = useParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageItem[]>([]);
  const [value, setValue] = useState<string>("");
  const [selectedChat, setSelectedChat] = useState<ChatItem>({});
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const UploadProps: UploadProps = {
    name: "file",
    accept: "image/* ,video/*,.ts",
    showUploadList: false,
    beforeUpload: (file) => {
      setFileList([...fileList, file]);
      return false;
    },
  };

  const getMessage = useCallback(async (chatId: number) => {
    try {
      const res = await services.Chat.getCurrentMessage({
        id: chatId,
        size,
      });
      setMessage(_.reverse(res.data.list));
      total = +res.data.total;
      setLoading(false);
      const el = document.getElementById("message-list");
      el && (el.scrollTop = el.scrollHeight);
    } catch (error: any) {
      const { response } = error;
      openNotification("error", response.data.message);
      setLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = async (file: any) => {
    const storageRef = ref(storageFB, file.name);
    const uploadTask = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(uploadTask.ref);
    return url;
  };

  const sendMessage = async (text: string, fileList: any) => {
    let usersId = selectedChat.users_id;
    let message = [];

    if (text) {
      message.push({ content: text, type: "text" });
    }
    if (fileList.length > 0) {
      //need upload video/img to firebase
      let files = await Promise.all(
        fileList.map(async (file: any) => {
          const content = await uploadFile(file);
          return { content, type: file.type };
        })
      );
      message = [...message, ...files];
    }
    //
    let data = {
      chatId,
      message,
      usersId,
    };
    // create mess in DB
    const res = await services.Chat.addNewMessage(data);
    // update all chat FE
    let newAllChat: ChatItem[] = _.cloneDeep(allChat);
    let index = newAllChat.findIndex((item: ChatItem) => {
      return item.chat_id === res.data[0].chat_room_id;
    });
    if (index !== -1) {
      newAllChat[index].content = res.data[res.data.length - 1].content;
      dispatch(setCurrentChat(newAllChat));
    }
    setMessage((prev) => {
      let newMess = [...prev, ...res.data];
      return newMess;
    });
    setValue("");
    setFileList([]);
    // send message realtime
    socket.emit("send-message-to-server", SelectedChatUserId, res.data);
  };

  const onScrollMessage = async (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollTop === 0 && chatId) {
      if (message.length === total) return;
      size += 25;
      try {
        const res = await services.Chat.getCurrentMessage({
          id: +chatId,
          size,
        });
        setMessage(_.reverse(res.data.list));
      } catch (error: any) {
        const { response } = error;
        openNotification("error", response.data.message);
      }
    }
  };

  const handleNotify = async (msg: MessageItem) => {
    await services.Chat.updateUserNoticeChatById(msg);
    let newAllChat: ChatItem[] = _.cloneDeep(allChat);
    let index = newAllChat.findIndex((item: ChatItem) => {
      return item.chat_id === msg.chat_room_id;
    });
    if (index !== -1) {
      newAllChat[index].content = msg.content;
      newAllChat[index].isNotice = true;
      dispatch(setCurrentChat(newAllChat));
    }
  };

  const onRemoveFile = (index: number) => {
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };

  const renderMessage = (message: ChatItem) => {
    if (message.tag && message.tag.includes("text")) {
      return message.content;
    }
    if (message.tag && ["video/mpeg", "video/mp4"].includes(message.tag)) {
      return (
        <video style={{ height: 400 }} controls muted>
          <source src={message.content} />
        </video>
      );
    }
    if (message.tag && message.tag.includes("image")) {
      return (
        <a href={message.content} target="_blank" rel="noreferrer">
          <img
            style={{ width: 200, height: 200 }}
            src={message.content}
            alt=""
          />
        </a>
      );
    }
    return (
      <a href={message.content} target="_blank" rel="noreferrer">
        Download file
      </a>
    );
  };

  useEffect(() => {
    if (chatId) getMessage(parseInt(chatId));
  }, [chatId, getMessage]);

  useEffect(() => {
    if (user.id) {
      const host =
        process.env.NODE_ENV === "development"
          ? "http://localhost:5000"
          : "https://quanghieu265-app-chat.onrender.com";
      socket = io(host);
      socket.on("connect", () => {
        socket.emit("setup-chat", user.id);
      });

      socket.on("disconnect", () => {});

      socket.on("connected-chat", () => {});

      socket.on("send-message-to-client", (msg: any) => {
        if (msg.chat_room_id === chatId) {
          setMessage((prev) => {
            let newMess = [...prev, ...msg];
            return newMess;
          });
        } else {
          handleNotify(msg);
        }
      });

      return () => {
        socket.off();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, user.id]);

  useEffect(() => {
    const el = document.getElementById("message-list");
    if (message && message.length <= 15) {
      el && (el.scrollTop = el.scrollHeight);
    } else {
      el && (el.scrollTop = el.scrollHeight / 2);
    }
  }, [message]);

  useEffect(() => {
    if (allChat && chatId) {
      const chat = allChat.filter((item) => item.chat_id === +chatId)[0];
      if (chat) {
        setSelectedChat(chat);
        SelectedChatUserId = chat.users_id?.filter((id) => id !== user.id)[0];
      } else {
        navigate("/chat/");
      }
    }
  }, [chatId, allChat, navigate, user.id]);

  return (
    <Card
      title={
        <Skeleton loading={loading} avatar active>
          <Meta
            avatar={
              selectedChat?.avatar ? (
                <Avatar src={selectedChat.avatar} />
              ) : (
                <UserOutlined />
              )
            }
            title={selectedChat?.chat_name}
          />
        </Skeleton>
      }
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
      actions={
        !loading
          ? [
              <div style={{ margin: "0px 8px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "4px 8px",
                    backgroundColor: "#F5F7FB",
                    borderRadius: 8,
                  }}
                >
                  <Input
                    value={value}
                    style={{ padding: 0 }}
                    bordered={false}
                    placeholder="Enter message"
                    onPressEnter={(e: any) => {
                      if (e.target.value || fileList.length > 0)
                        sendMessage(e.target.value, fileList);
                    }}
                    onChange={(e: any) => {
                      setValue(e.target.value);
                    }}
                  />
                  <Upload {...UploadProps} fileList={fileList}>
                    <Button icon={<UploadOutlined />}></Button>
                  </Upload>
                </div>
                {fileList.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      flexWrap: "wrap",
                      marginTop: 8,
                    }}
                  >
                    {fileList.map((item, index) => {
                      return (
                        <Button
                          key={index}
                          type="text"
                          onClick={() => {
                            onRemoveFile(index);
                          }}
                        >
                          {item.name}
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>,
            ]
          : []
      }
    >
      <div
        id={"message-list"}
        className="message-list"
        onScroll={onScrollMessage}
      >
        {message.map((message, index) => {
          return (
            <div
              key={index}
              className={message.sender !== user.id ? "reader" : "sender"}
            >
              <Tooltip
                title={moment(message.created_on).format("DD-MM-YYYY HH:mm")}
                trigger="hover"
              >
                {renderMessage(message)}
              </Tooltip>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MessageList;
