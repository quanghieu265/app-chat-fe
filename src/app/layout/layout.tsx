import {
  DesktopOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PhoneOutlined,
  PieChartOutlined,
  UserOutlined
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Dropdown,
  Layout,
  Menu,
  MenuProps,
  theme
} from "antd";
import React, { ReactNode, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import {
  removeAuthenticated,
  setFriendList
} from "../modules/auth/redux/action";
import { RootState } from "../redux/store";
import services from "../services";
import ChangeAvatar from "./container/ChangeAvatar";

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
    label
  } as MenuItem;
}

interface Props {
  children?: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  const handleLogOut = async () => {
    await services.Auth.logoutUser();
    localStorage.clear();
    dispatch(removeAuthenticated());
  };

  const items: MenuProps["items"] = [
    {
      key: "2",
      label: <ChangeAvatar />
    },
    {
      key: "1",
      label: <div onClick={handleLogOut}>Log out</div>
    }
  ];

  const menuItems: MenuItem[] = [
    getItem(
      "Blogs",
      "blogs",
      <UserOutlined />,
      (user
        ? [
            getItem(
              <Link to={`blogs/${user.username}`}>{user.username}</Link>,
              `sub-blog-${user.id}`
            )
          ]
        : []
      ).concat(
        (user.friends_id || []).map(i => {
          return getItem(
            <Link to={`blogs/${i.username}`}>{i.username}</Link>,
            `sub-blog-${i.id}`
          );
        })
      )
    ),
    getItem(<Link to="chat">Chat</Link>, "chat", <PieChartOutlined />),
    getItem(<Link to="call">Video Call</Link>, "call", <PhoneOutlined />),
    getItem(<Link to="stream">Streaming</Link>, "stream", <DesktopOutlined />)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const getBreadCrumb = useCallback(() => {
    let path = location.pathname;
    const item = path.split("/");
    if (item && item.length) {
      return item.map(i => {
        return {
          title: i === "" ? <HomeOutlined /> : i
        };
      });
    }

    return [];
  }, [location]);

  const getFriendsList = useCallback(async () => {
    const res = await services.Chat.getFriendList();
    if (res.data) {
      dispatch(setFriendList(res.data));
    }
  }, []);

  useEffect(() => {
    getFriendsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout style={{ height: "100vh", overflow: "hidden" }}>
      {/* Side Menu */}
      <Sider trigger={null} collapsed={collapsed}>
        <div
          style={{
            height: 32,
            margin: 16,
            background: "rgba(255, 255, 255, 0.2)"
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
        {/* Header */}
        <Header
          className="layout-header"
          style={{ padding: "0px 16px", background: colorBgContainer }}
        >
          {/* Button collapse Menu */}
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: "trigger",
              onClick: () => setCollapsed(!collapsed)
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
              src={user.avatar_url}
                style={{ cursor: "pointer", marginLeft: 8 }}
                icon={<UserOutlined />}
              />
            </Dropdown>
          </div>
        </Header>

        {/* Main content */}
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }} items={getBreadCrumb()} />
          <div
            style={{
              padding: 24,
              minHeight: 280,
              background: colorBgContainer,
              flex: "auto",
              overflowY: "auto"
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
