'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'Host' | 'Anchor' | 'User' | null;

interface AuthState {
    user_id: number | null;
    role: Role;
    name: string | null;
    setAuth: (user_id: number, role: Role, name?: string | null) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user_id: null,
            role: null,
            name: null,
            setAuth: (user_id, role, name = null) => set({ user_id, role, name }),
            clearAuth: () => set({ user_id: null, role: null, name: null }),
        }),
        {
            name: 'stagesync-auth',
        }
    )
);
