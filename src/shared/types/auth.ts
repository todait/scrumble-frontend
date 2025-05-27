export interface User {
  id: string;
  email: string;
  name: string;
  avatarURL: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: TokenPair;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: TokenPair | null;
} 