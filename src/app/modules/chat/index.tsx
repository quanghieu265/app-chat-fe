import { Col, Row } from "antd";
import React from "react";
import { Outlet } from "react-router-dom";
import FriendList from "./components/friend-list";

const ChatPage: React.FC = () => {
  return (
    <Row className="row-height">
      <Col span={6}>
        <FriendList />
      </Col>
      <Col span={18} style={{ padding: "0px 8px", height: "100%" }}>
        <Outlet />
      </Col>
    </Row>
  );
};

export default ChatPage;
