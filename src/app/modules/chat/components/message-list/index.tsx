import { UserOutlined } from "@ant-design/icons";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Avatar, Card, Input, Skeleton, Tooltip } from "antd";
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

  const sendMessage = async (e: any) => {
    let message = e.target.value;
    let usersId = selectedChat.users_id;
    let data = {
      chatId,
      message,
      usersId,
    };
    const res = await services.Chat.addNewMessage(data);
    let newAllChat: ChatItem[] = _.cloneDeep(allChat);
    let index = newAllChat.findIndex((item: ChatItem) => {
      return item.chat_id === res.data.chat_room_id;
    });
    if (index !== -1) {
      newAllChat[index].content = res.data.content;
      dispatch(setCurrentChat(newAllChat));
    }
    setMessage((prev) => {
      let newMess = [...prev];
      newMess.push(res.data);
      return newMess;
    });
    socket.emit("send-message-to-server", SelectedChatUserId, res.data);
    setValue("");
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
            let newMess = [...prev];
            newMess.push(msg);
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
              <div style={{ display: "flex", padding: "0px 8px" }}>
                <Input
                  value={value}
                  style={{ backgroundColor: "#F5F7FB", padding: 8 }}
                  bordered={false}
                  placeholder="Enter message"
                  onPressEnter={(e: any) => {
                    if (e.target.value) sendMessage(e);
                  }}
                  onChange={(e: any) => {
                    setValue(e.target.value);
                  }}
                />
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
                {message.content}
              </Tooltip>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MessageList;
