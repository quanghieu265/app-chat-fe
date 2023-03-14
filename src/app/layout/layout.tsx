import {
  DesktopOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PhoneOutlined,
  PieChartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Dropdown,
  Layout,
  Menu,
  MenuProps,
  theme,
} from "antd";
import React, { ReactNode, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { removeAuthenticated } from "../modules/auth/redux/action";
import { RootState } from "../redux/store";

const { Header, Content, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const menuItems: MenuItem[] = [
  getItem(<Link to="stream">Streaming</Link>, "stream", <DesktopOutlined />),
  getItem(<Link to="chat">Chat</Link>, "chat", <PieChartOutlined />),
  getItem(<Link to="call">Video Call</Link>, "call", <PhoneOutlined />),
    getItem("Friends", "sub1", <UserOutlined />, [
    getItem("Tom", "3"),
    getItem("Bill", "4"),
    getItem("Alex", "5"),
  ]),
];

interface Props {
  children?: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const handleLogOut = () => {
    localStorage.removeItem("user");
    dispatch(removeAuthenticated());
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <div onClick={handleLogOut}>Log out</div>,
    },
  ];

  const getSelectMenu = useCallback(() => {
    let path = location.pathname;
    let menuSelected = menuItems.map((item: any) => {
      if (path.includes(item.key)) {
        return item.key;
      } else {
        return "";
      }
    });

    return menuSelected;
  }, [location]);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      <Sider trigger={null} collapsed={collapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)",
          }}
        />
        <Menu
          theme="dark"
          defaultSelectedKeys={getSelectMenu()}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="layout-header"
          style={{ padding: "0px 16px", background: colorBgContainer }}
        >
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed),
            }
          )}
          <div style={{ display: "flex", alignItems: "center" }}>
            <p>{user?.username}</p>
            <Dropdown
              arrow
              trigger={["click"]}
              menu={{ items }}
              placement="bottomRight"
            >
              <Avatar
                style={{ cursor: "pointer", marginLeft: 8 }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }}>
            <Breadcrumb.Item>User</Breadcrumb.Item>
            <Breadcrumb.Item>Bill</Breadcrumb.Item>
          </Breadcrumb>
          <div
            style={{
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              flex: "auto",
              overflowY: "auto",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
