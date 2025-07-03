import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { ChatSession } from "../types/api";

const ChatBotPage: React.FC = () => {
  const { user } = useAuth();
  const {
    messages,
    sessions,
    currentSession,
    isLoading,
    isSending,
    sendMessage,
    selectSession,
    createSession,
    clearMessages,
  } = useChat();

  const [input, setInput] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;

    const userMsg = input;
    setInput("");
    await sendMessage(userMsg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = async () => {
    await createSession();
    clearMessages();
  };

  const formatSessionTitle = (session: ChatSession) => {
    // Tạo title từ sessionId hoặc sử dụng default
    return `Chat ${session.sessionId.slice(-6)}`;
  };

  if (!user) {
    return (
      <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Vui lòng đăng nhập để sử dụng chatbot
          </h2>
          <p className="text-gray-500">
            Bạn cần đăng nhập để có thể lưu trữ và xem lại lịch sử chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-80px)] flex bg-gray-50">
      {/* Sidebar lịch sử chat */}
      <aside
        className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-72"
        }`}
      >
        {/* Header với toggle button */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold text-gray-800">
              Lịch sử chat
            </h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                sidebarCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </div>

        {/* New chat button */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={handleNewChat}
            disabled={isLoading}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              sidebarCollapsed ? "p-2" : "space-x-2"
            } ${
              isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {!sidebarCollapsed && <span>Chat mới</span>}
          </button>
        </div>

        {/* Chat history list */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
              Đang tải...
            </div>
          ) : (
            <ul className="p-2 space-y-1">
              {sessions.map((session) => (
                <li
                  key={session.sessionId}
                  className={`p-2 rounded cursor-pointer transition font-medium ${
                    currentSession?.sessionId === session.sessionId
                      ? "bg-orange-100 text-orange-700"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                  onClick={() => selectSession(session)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">💬</span>
                    {!sidebarCollapsed && (
                      <span className="truncate">
                        {formatSessionTitle(session)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {sessions.length === 0 && !sidebarCollapsed && (
                <li className="p-4 text-center text-gray-500 text-sm">
                  Chưa có cuộc trò chuyện nào
                </li>
              )}
            </ul>
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">
            {currentSession ? formatSessionTitle(currentSession) : "Chat mới"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            FPT University AI Assistant
          </p>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải tin nhắn...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Xin chào! Tôi là AI Assistant của FPT University
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Tôi có thể giúp bạn tìm hiểu về các chương trình học, học phí,
                và các thông tin khác về FPT University. Hãy bắt đầu cuộc trò
                chuyện!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.sender === "user"
                      ? "bg-orange-500 text-white"
                      : "bg-white text-gray-800 border border-gray-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))
          )}

          {isSending && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                  <span className="text-sm text-gray-500">
                    AI đang trả lời...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 p-4 bg-white">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              disabled={isSending}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Gửi</span>
                </div>
              ) : (
                "Gửi"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBotPage;
