import { useState, useEffect, FormEvent } from "react";
import Image from "next/image";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null; // <-- FIX: Allow profiles to be null
}

export default function ChatBox() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [supabase, setSupabase] = useState<any>(null);

  useEffect(() => {
    // FIX: Initialize Supabase on the client-side
    const client = createClientComponentClient();
    setSupabase(client);

    const fetchHistory = async () => {
      const { data, error } = await client
        .from("chat_messages")
        .select(`
          id,
          content,
          created_at,
          profiles!inner(username, avatar_url)
        `)
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) {
        console.error("Error fetching chat history:", error);
      } else {
        // @ts-ignore
        setMessages(data.reverse() as ChatMessage[]);
      }
      setLoading(false);
    };
    fetchHistory();

    const channel = client
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "" || !supabase) return;

    try {
      await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      setNewMessage("");
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
          <div key={msg.id} className="flex items-start space-x-2">
            {/* FIX: Use optional chaining to safely access nested properties */}
            {msg.profiles?.avatar_url && (
              <Image
                src={msg.profiles.avatar_url}
                alt={msg.profiles.username}
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <div>
              <span className="font-bold">{msg.profiles?.username}</span>
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
          disabled={!supabase}
        >
          Send
        </button>
      </form>
    </div>
  );
}
