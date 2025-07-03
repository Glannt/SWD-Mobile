// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Enums
export enum UserRole {
  ADMIN = "admin",
  STUDENT = "student",
  STAFF = "staff",
  TEACHER = "teacher",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

// CreateUserDto - Dành cho admin tạo user
export interface CreateUserDto {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
  batch?: string; // IntakeBatch
  dateOfBirth?: Date;
  status?: UserStatus;
}

// RegisterDto - Dành cho user tự đăng ký
export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  confirmPassword: string;
  batch?: string; // IntakeBatch
  dateOfBirth?: Date;
  isRegister: boolean;
}

// Reset Password Types
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyResetTokenRequest {
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetTokenResponse {
  success: boolean;
  message: string;
  email?: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface User {
  user_id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

// User Profile interface - dựa trên backend response
export interface UserProfile {
  user_id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  chat_message_id: string;
  content: string;
  sender: "user" | "bot" | "staff";
  intent?: string;
  confidence?: number;
  timestamp?: string;
  sessionId?: string;
}

export interface ChatSession {
  sessionId: string;
  status: string;
  startedAt?: string;
  lastActivity?: string;
}

export interface AskQuestionRequest {
  question: string;
  sessionId?: string;
  user_id?: string;
}

export interface AskQuestionResponse {
  answer: string;
  sessionId?: string;
  citations?: Citation[];
  usage?: TokenUsage;
}

export interface Citation {
  position: number;
  references: Reference[];
}

export interface Reference {
  pages: string[];
  file: {
    id: string;
    name: string;
    metadata: unknown;
    createdOn?: string;
    updatedOn?: string;
    status: string;
    size: number;
  };
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

// Campus Types
export interface Campus {
  id: string;
  name: string;
  location: string;
  description: string;
  programs: Program[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  tuition: number;
  requirements: string[];
}

// Error Types
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}
