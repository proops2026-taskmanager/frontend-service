import { useQuery } from '@tanstack/react-query';
import api from './axios';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

async function fetchUsers(): Promise<User[]> {
  const res = await api.get<{ users: User[] }>('/users');
  return res.data.users;
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserMap(): Map<string, User> {
  const { data = [] } = useUsers();
  return new Map(data.map((u) => [u.id, u]));
}
