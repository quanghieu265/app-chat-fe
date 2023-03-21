import {
  DesktopOutlined,
  PhoneOutlined,
  PieChartOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useRoutes } from "react-router-dom";
import AuthComponent from "../modules/auth/index";
import VideoCallPage from "../modules/call";
import ChatPage from "../modules/chat";
import MessageList from "../modules/chat/components/message-list";
import StreamPage from "../modules/stream";

interface IRoutes {
  name?: string;
  path?: string;
  element?: JSX.Element;
  icon?: JSX.Element;
  children?: IRoutes[];
  subMenu?: boolean;
}

export const privateRoutes: IRoutes[] = [
  {
    name: "Streaming",
    path: "stream",
    element: <StreamPage />,
    icon: <DesktopOutlined />
  },
  {
    name: "Video Call",
    path: "call",
    element: <VideoCallPage />,
    icon: <PhoneOutlined />
  },
  {
    name: "Chat",
    path: "chat",
    element: <ChatPage />,
    icon: <PieChartOutlined />,
    children: [
      {
        path: ":chatId",
        element: <MessageList />
      }
    ]
  },
  {
    name: "Blogs",
    path: "/blogs",
    element: <ChatPage />,
    icon: <UserOutlined />,
    children: [
      {
        path: ":userId",
        element: <MessageList />
      }
    ]
  }
];

export function PrivateRoutes() {
  let element = useRoutes(privateRoutes);

  return element;
}

export function PublicRoutes() {
  let element = useRoutes([
    {
      path: "auth/*",
      element: <AuthComponent />
    }
  ]);

  return element;
}
