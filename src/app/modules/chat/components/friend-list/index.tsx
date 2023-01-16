import { DeleteOutlined, MoreOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, List, MenuProps, Popconfirm } from "antd";
import { log } from "console";
import VirtualList from "rc-virtual-list";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { openNotification } from "src/app/layout/notification";
import { RootState } from "src/app/redux/store";
import services from "src/app/services";
import { getCurrentChat } from "../../redux/action";
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
  }, [dispatch]);

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
      setData((prev) => {
        return prev.filter((item) => item.chat_id !== id);
      });
      openNotification("success", "Delete successfully");
    }
  };

  return (
    <>
      <div className="chat-lists">
        <h1>Chats</h1>
        <SearchFriends />
        <h1>Recent</h1>
        <List>
          <VirtualList
            data={data}
            // height={height}
            itemHeight={47}
            itemKey="email"
            onScroll={onScroll}
          >
            {(item: ChatItem) => (
              <List.Item
                key={item.chat_id}
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
                  </Popconfirm>,
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
    </>
  );
};

export default FriendList;
