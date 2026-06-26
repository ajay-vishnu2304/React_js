import { useState } from "react";
import "./ChatBox.css";

export interface Message {
  id: number;
  sender_role: "user" | "admin";
  content: string;
  created_at: string;
}

interface ChatBoxProps {
  messages: Message[];
  onSend: (text: string) => void;
  placeholder: string;
  rightRole: "user" | "admin";
}

const ChatBox = ({
  messages,
  onSend,
  placeholder,
  rightRole,
}: ChatBoxProps) => {
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="chat-box-wrapper">
      <div className="messages-area">
        {messages.length === 0 ? (
          <p className="empty">Chat empty</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.sender_role === rightRole ? "msg right" : "msg left"
              }
            >
              {msg.content}
            </div>
          ))
        )}
      </div>

      <div className="send-area">
        <input
          type="text"
          value={input}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
