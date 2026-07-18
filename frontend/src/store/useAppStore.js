import { create } from 'zustand';

export const useAppStore = create((set) => ({
  user: null,
  fridgeItems: [],
  loading: true,
  setUser: (user) => set({ user }),
  setFridgeItems: (fridgeItems) => set({ fridgeItems }),
  setLoading: (loading) => set({ loading }),
}));