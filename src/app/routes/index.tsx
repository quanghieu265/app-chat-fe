import {
  DesktopOutlined,
  PhoneOutlined,
  PieChartOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useRoutes } from "react-router-dom";
import AuthComponent from "../modules/auth/index";
import VideoCallRoutes from "../modules/call";
import ChatRoutes from "../modules/chat";
import StreamRoutes from "../modules/stream";
import BlogRoutes from "../modules/blogs";

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
    path: "stream/*",
    element: <StreamRoutes />,
    icon: <DesktopOutlined />
  },
  {
    name: "Video Call",
    path: "call/*",
    element: <VideoCallRoutes />,
    icon: <PhoneOutlined />
  },
  {
    name: "Chat",
    path: "chat/*",
    element: <ChatRoutes />,
    icon: <PieChartOutlined />
  },
  {
    name: "Blogs",
    path: "blogs/*",
    element: <BlogRoutes />,
    icon: <UserOutlined />
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
