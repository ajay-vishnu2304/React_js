import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import ChatBox, { type Message } from "../../components/ChatBox";
import "./Chat.css";

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { authFetch } = useAuthenticatedFetch();

  useEffect(() => {
    authFetch("/chat/history")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error(err));

    socket.connect();
    socket.on("new_message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("new_message");
      socket.disconnect();
    };
  }, [authFetch]);

  const send = (text: string) => {
    socket.emit("user-message", { content: text });
  };

  return (
    <div className="user-chat-page">
      <ChatBox
        messages={messages}
        onSend={send}
        placeholder="Type a message..."
        rightRole="user"
      />
    </div>
  );
};

export default Chat;
