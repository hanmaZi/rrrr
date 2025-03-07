
export interface User {
  id?: number;
  username: string;
  password?: string;
  role?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}
