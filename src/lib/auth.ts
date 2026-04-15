const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';

export interface CurrentUser {
  id: string;
  email: string;
  role: 'member' | 'lead';
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuth(token: string, user: CurrentUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCurrentUser(): CurrentUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as CurrentUser) : null;
}
