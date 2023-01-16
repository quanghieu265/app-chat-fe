import { UserOutlined } from "@ant-design/icons";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Avatar, Card, Input, Skeleton } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
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
const MessageList: React.FC = () => {
  const _ = require("lodash");
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const allChat = useSelector((state: RootState) => state.chat.currentChat);
  const { chatId } = useParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageItem[]>([]);
  const [value, setValue] = useState<string>("");
  const [chat, setChat] = useState<ChatItem>({});

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
    let usersId = chat.users_id;
    let data = {
      chatId,
      message,
      usersId,
    };
    try {
      const res = await services.Chat.addNewMessage(data);
      let newCurrentChat = _.cloneDeep(allChat);
      newCurrentChat.content = res.data.content;
      dispatch(setCurrentChat(newCurrentChat));
      setMessage((prev) => {
        let newMess = [...prev];
        newMess.push(res.data);
        return newMess;
      });
      socket.emit("send-message-to-server", res.data);
    } catch (error: any) {
      const { response } = error;
      openNotification("error", response.data.message);
    }
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

  useEffect(() => {
    if (chatId) getMessage(parseInt(chatId));
  }, [chatId, getMessage]);

  useEffect(() => {
    if (chatId) {
      socket = io("https://quanghieu265-app-chat.onrender.com");
      socket.on("connect", () => {
        socket.emit("setup-chat", chatId);
      });

      socket.on("disconnect", () => {});

      socket.on("connected-chat", () => {});

      socket.on("send-message-to-client", (msg: any) => {
        setMessage((prev) => {
          let newMess = [...prev];
          newMess.push(msg);
          return newMess;
        });
      });

      return () => {
        socket.off();
      };
    }
  }, [chatId]);

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
      setChat(allChat.filter((item) => item.chat_id === +chatId)[0]);
    }
  }, [chatId, allChat]);

  return (
    <Card
      title={
        <Skeleton loading={loading} avatar active>
          <Meta
            avatar={
              chat?.avatar ? <Avatar src={chat.avatar} /> : <UserOutlined />
            }
            title={chat?.chat_name}
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
              {message.content}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default MessageList;
