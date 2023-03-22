import { lazy, memo } from "react";
import { Route, Routes } from "react-router-dom";
import MessageList from "./components/message-list";
const ChatPage = lazy(() => import("./pages/chat-page"));

const ChatRoutes = memo(() => {
  return (
    <Routes>
      <Route path="/" element={<ChatPage />}>
        <Route path=":chatId" element={<MessageList />} />
      </Route>
    </Routes>
  );
});
export default ChatRoutes;
