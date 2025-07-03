import { useState, useCallback, useEffect } from "react";
import { chatService } from "../services";
import { useAuth } from "./useAuth";
import type {
  ChatMessage,
  ChatSession,
  AskQuestionRequest,
} from "../types/api";

interface UseChatReturn {
  messages: ChatMessage[];
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoading: boolean;
  isSending: boolean;
  sendMessage: (message: string) => Promise<void>;
  loadSessions: () => Promise<void>;
  loadSession: (sessionId: string) => Promise<void>;
  createSession: () => Promise<void>;
  selectSession: (session: ChatSession) => void;
  clearMessages: () => void;
}

export const useChat = (): UseChatReturn => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Load user sessions on mount
  useEffect(() => {
    if (user?.user_id) {
      loadSessions();
    }
  }, [user?.user_id]);

  const loadSessions = useCallback(async () => {
    if (!user?.user_id) return;

    setIsLoading(true);
    try {
      const sessionsData = await chatService.getUserSessions(user.user_id);
      setSessions(sessionsData);
      console.log("✅ Loaded sessions:", sessionsData);
    } catch (error) {
      console.error("Failed to load sessions:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.user_id]);

  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const messagesData = await chatService.getSessionMessages(sessionId);
      setMessages(messagesData);
      console.log("✅ Loaded messages for session:", sessionId, messagesData);
    } catch (error) {
      console.error("Failed to load session messages:", error);
      setMessages([]); // Clear messages on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSession = useCallback(async () => {
    if (!user?.user_id) return;

    try {
      const newSession = await chatService.createSession(user.user_id);
      console.log("✅ Created new session:", newSession);

      setCurrentSession(newSession);
      setMessages([]);

      // Refresh sessions list to include the new session
      await loadSessions();
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  }, [user?.user_id, loadSessions]);

  const selectSession = useCallback(
    (session: ChatSession) => {
      console.log("✅ Selecting session:", session);
      setCurrentSession(session);
      loadSession(session.sessionId);
    },
    [loadSession]
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim()) return;

      setIsSending(true);

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        chat_message_id: `temp_${Date.now()}`,
        content: message,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      try {
        // Send to AI
        const request: AskQuestionRequest = {
          question: message,
          sessionId: currentSession?.sessionId,
          user_id: user?.user_id,
        };

        console.log("✅ Sending message to AI:", request);
        const response = await chatService.askQuestion(request);
        console.log("✅ AI response:", response);

        // Add AI response
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          chat_message_id: `temp_${Date.now() + 1}`,
          content: response.answer,
          sender: "bot",
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Update current session if it's a new session
        if (!currentSession && response.sessionId) {
          console.log("✅ New session created, updating current session");
          const newSession = await chatService.getSession(response.sessionId);
          setCurrentSession(newSession);

          // Refresh sessions list to include the new session
          await loadSessions();
        }
      } catch (error) {
        console.error("Failed to send message:", error);
        // Remove user message on error
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      } finally {
        setIsSending(false);
      }
    },
    [currentSession, user?.user_id, loadSessions]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sessions,
    currentSession,
    isLoading,
    isSending,
    sendMessage,
    loadSessions,
    loadSession,
    createSession,
    selectSession,
    clearMessages,
  };
};
