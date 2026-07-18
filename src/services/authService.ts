import type { User } from '../types/models';
import { request } from './api';

export async function authenticate(username: string, password: string) {
  const users = await request<User[]>(`/users?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
  return users[0] ?? null;
}
