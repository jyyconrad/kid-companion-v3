import { create } from 'zustand';
import { Message } from '../components/MessageBubble';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
      error: null,
    })),
  setLoading: (loading) =>
    set((state) => ({
      isLoading: loading,
      error: loading ? null : state.error,
    })),
  setError: (error) =>
    set((state) => ({
      error,
      isLoading: false,
    })),
  clearMessages: () =>
    set(() => ({
      messages: [],
      error: null,
      isLoading: false,
    })),
}));
