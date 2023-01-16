import { useRoutes } from "react-router-dom";
import AuthComponent from "../modules/auth/index";
import ChatPage from "../modules/chat";
import MessageList from "../modules/chat/components/message-list";

export function PrivateRoutes() {
  let element = useRoutes([
    {
      path: "about",
      element: <div>About Page</div>,
    },
    {
      path: "home",
      element: <div>Home Page</div>,
    },
    {
      path: "stream",
      element: <div>Stream Page</div>,
    },
    {
      path: "/chat",
      element: <ChatPage />,
      children: [
        {
          path: ":chatId",
          element: <MessageList />,
        },
      ],
    },
  ]);

  return element;
}

export function PublicRoutes() {
  let element = useRoutes([
    {
      path: "auth/*",
      element: <AuthComponent />,
    },
  ]);

  return element;
}
