import { BellOutlined, DeleteOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, List, Popconfirm } from "antd";
import VirtualList from "rc-virtual-list";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { openNotification } from "src/app/layout/notification";
import { RootState } from "src/app/redux/store";
import services from "src/app/services";
import { getCurrentChat, setCurrentChat } from "../../redux/action";
import { ChatItem } from "../../redux/slice";
import SearchFriends from "../search-list";

const FriendList: React.FC = () => {
  const dispatch = useDispatch();
  const currentChat = useSelector((state: RootState) => state.chat.currentChat);
  const [data, setData] = useState<ChatItem[]>([]);
  const [height, setHeight] = useState<number>(400);

  useEffect(() => {
    dispatch(getCurrentChat());
    const el = document.getElementsByClassName("row-height")[0];
    if (el) {
      // setHeight(el.clientHeight);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setData(currentChat);
  }, [currentChat]);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (e.currentTarget.scrollHeight - e.currentTarget.scrollTop === height) {
      // appendData();
    }
  };

  const handleDeleteChat = async (id?: number) => {
    const res = await services.Chat.deleteChatById({ id: id });
    if (res.status === 200) {
      dispatch(setCurrentChat(data.filter(item => item.chat_id !== id)));
      openNotification("success", "Delete successfully");
    }
  };

  return (
    <>
      <div className="chat-lists">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px 0px"
          }}
        >
          <h1>Chats</h1>
          <Button type="text">
            <Badge
              count={100}
              size={"small"}
              style={{ padding: "0px 8px" }}
              offset={[10, 0]}
            >
              <BellOutlined style={{ fontSize: 16 }} />
            </Badge>
          </Button>
        </div>
        <SearchFriends />
        <div
          style={{
            padding: "12px 0px"
          }}
        >
          <h1>Recent</h1>
          <List>
            <VirtualList
              data={data}
              // height={height}
              itemHeight={47}
              itemKey="chat_id"
              onScroll={onScroll}
            >
              {(item: ChatItem, index) => (
                <List.Item
                  key={index}
                  style={{ padding: "12px 0px" }}
                  actions={[
                    <Popconfirm
                      placement="right"
                      title={"Are you sure to delete this chat?"}
                      description={"Delete chat"}
                      onConfirm={() => {
                        handleDeleteChat(item.chat_id);
                      }}
                      okText="Confirm"
                      cancelText="Cancel"
                    >
                      <Button type="text" icon={<DeleteOutlined />}></Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={""} />}
                    title={<Link to={`${item.chat_id}`}>{item.chat_name}</Link>}
                    description={item.content}
                  />
                </List.Item>
              )}
            </VirtualList>
          </List>
        </div>
      </div>
    </>
  );
};

export default FriendList;
