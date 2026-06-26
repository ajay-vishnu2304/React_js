import { useEffect, useState } from "react";
import { socket } from "../../socket";
import { useAuthenticatedFetch } from "../../hooks/useAuthenticatedFetch";
import ChatBox, { type Message } from "../../components/ChatBox";
import "../chat/Chat.css";

interface MessageWithUser extends Message {
  user_id: number;
  username: string;
}

const Support = () => {
  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [activeUser, setActiveUser] = useState<number | null>(null);
  const { authFetch } = useAuthenticatedFetch();

  useEffect(() => {
    authFetch("/chat/all")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.error(err));

    socket.connect();
    socket.on("new_message", (msg: MessageWithUser) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("new_message");
      socket.disconnect();
    };
  }, [authFetch]);

  const users = Array.from(new Set(messages.map((m) => m.user_id)));

  const currentMessages = messages.filter((m) => m.user_id === activeUser);

  const reply = (text: string) => {
    if (activeUser === null) return;
    socket.emit("admin-message", { userId: String(activeUser), content: text });
  };

  return (
    <div>
      <h2>Support Inbox</h2>
      <div className="support-page">
        <div className="users-list">
          {users.length === 0 ? (
            <p className="empty">No users yet</p>
          ) : (
            users.map((id) => (
              <button
                key={id}
                className={id === activeUser ? "user-btn active" : "user-btn"}
                onClick={() => setActiveUser(id)}
              >
                {messages.find((m) => m.user_id === id)?.username || `User #${id}`}
              </button>
            ))
          )}
        </div>

        <div className="chat-section">
          {activeUser === null ? (
            <p className="empty">Select a user to chat</p>
          ) : (
            <ChatBox
              messages={currentMessages}
              onSend={reply}
              placeholder="Reply..."
              rightRole="admin"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
