import { apiPost, apiGet } from "../utils/api";
import {
  AskQuestionRequest,
  AskQuestionResponse,
  ChatSession,
  ChatMessage,
} from "../types/api";

class ChatService {
  private readonly baseUrl = "/app";

  async askQuestion(request: AskQuestionRequest): Promise<AskQuestionResponse> {
    return apiPost<AskQuestionResponse>(`${this.baseUrl}/ask`, request);
  }

  async getUserSessions(userId: string): Promise<ChatSession[]> {
    return apiGet<ChatSession[]>(`/chatsession/user/${userId}`);
  }

  async getSession(sessionId: string): Promise<ChatSession> {
    return apiGet<ChatSession>(`/chatsession/${sessionId}`);
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    return apiGet<ChatMessage[]>(`/chatsession/${sessionId}/messages`);
  }

  async createSession(
    userId?: string,
    anonymousId?: string
  ): Promise<ChatSession> {
    return apiPost<ChatSession>("/chatsession/create", {
      userId,
      anonymousId,
    });
  }

  async addMessage(
    sessionId: string,
    sender: "user" | "bot" | "staff",
    content: string,
    intent?: string,
    confidence?: number
  ): Promise<ChatMessage> {
    return apiPost<ChatMessage>(`/chatsession/${sessionId}/messages`, {
      sender,
      content,
      intent,
      confidence,
    });
  }
}

export const chatService = new ChatService();
export default chatService;
