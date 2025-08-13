import { useState } from "react";
import Image from "next/image";
import { useChat } from "../hooks/useChat"; // Adjust path if needed

export default function ChatBox() {
  const { messages, loading } = useChat();
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The Authorization header is handled automatically by auth-helpers-nextjs on the server.
        },
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage(""); // Clear the input field
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start space-x-3">
            {msg.profiles.avatar_url && (
              <Image
                src={msg.profiles.avatar_url}
                alt={msg.profiles.username}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div>
              <span className="font-bold">{msg.profiles.username}</span>
              <p>{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="p-4 flex items-center space-x-2 border-t border-gray-700">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Send a message..."
          className="flex-1 p-2 bg-gray-700 rounded-lg text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 rounded-lg text-white font-bold"
        >
          Send
        </button>
      </form>
    </div>
  );
}