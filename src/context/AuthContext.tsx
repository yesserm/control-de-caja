import { createContext, type PropsWithChildren, useMemo, useState } from 'react';
import type { User } from '../types/models';

type AuthContextValue = { user: User | null; setUser: (user: User) => void; logout: () => void };

export const AuthContext = createContext<AuthContextValue>({ user: null, setUser: () => undefined, logout: () => undefined });

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const value = useMemo(() => ({ user, setUser, logout: () => setUser(null) }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
