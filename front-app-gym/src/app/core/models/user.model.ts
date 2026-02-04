export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active?: boolean;
}

export interface UserRegistration {
  email: string;
  username: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: User;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
  refresh?: string;
}