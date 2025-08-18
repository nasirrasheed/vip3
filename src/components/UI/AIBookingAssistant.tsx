import React, { useEffect, useRef, useState } from "react";
import { VIPBookingAssistant, ChatMessage } from "../lib/vipAssistant";

interface Props {
  isVisible?: boolean;
  position?: "bottom-right" | "bottom-left";
}

export default function AIBookingAssistant({ isVisible = true, position = "bottom-right" }: Props) {
  const [assistant] = useState(() => new VIPBookingAssistant(crypto.randomUUID()));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setInput("");
    setLoading(true);

    const { response } = await assistant.processMessage(userMessage);

    setMessages((prev) => [...prev, { role: "assistant", content: response, timestamp: new Date() }]);
    setLoading(false);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed z-50 w-96 h-[32rem] bg-white shadow-2xl rounded-2xl flex flex-col"
      style={{ bottom: "1rem", right: position === "bottom-right" ? "1rem" : "auto", left: position === "bottom-left" ? "1rem" : "auto" }}
    >
      <div className="p-3 font-semibold text-white bg-gray-900 rounded-t-2xl">VIP Booking Assistant</div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg max-w-[80%] ${msg.role === "user" ? "bg-blue-500 text-white ml-auto" : "bg-gray-200 text-gray-900 mr-auto"}`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-gray-400 text-xs">Assistant is typing…</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="p-2 border-t flex">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 p-2 border rounded-lg text-sm"
          placeholder="Type your message…"
        />
        <button onClick={sendMessage} className="ml-2 px-4 bg-blue-600 text-white rounded-lg text-sm">
          Send
        </button>
      </div>
    </div>
  );
}
