import { create } from "zustand";
import { api } from "../lib/api.js";
import { useAuthStore } from "./authStore.js";

export const useTransactionStore = create((set, get) => ({
    transactions: [],
    total: 0,
    summary: null,
    loading: false,

    fetchTransactions: async (queryStr) => {
        const { accessToken } = useAuthStore.getState();
        set({ loading: true });
        try {
            const res = await api.get(`/api/v1/transactions?${queryStr}`, { accessToken });
            set({ transactions: res.data?.transactions || [], total: res.data?.total || 0 });
        } finally {
            set({ loading: false });
        }
    },

    fetchTransactionSummary: async () => {
        const { accessToken } = useAuthStore.getState();
        try {
            const res = await api.get("/api/v1/transactions/summary", { accessToken });
            set({ summary: res.data || null });
        } catch { /* ignore */ }
    },

    createTransaction: async (data) => {
        const { accessToken } = useAuthStore.getState();
        await api.post("/api/v1/transactions", data, { accessToken });
        await get().fetchTransactionSummary();
    },

    updateTransaction: async (id, data) => {
        const { accessToken } = useAuthStore.getState();
        await api.put(`/api/v1/transactions/${id}`, data, { accessToken });
        await get().fetchTransactionSummary();
    },

    deleteTransaction: async (id) => {
        const { accessToken } = useAuthStore.getState();
        await api.del(`/api/v1/transactions/${id}`, { accessToken });
        await get().fetchTransactionSummary();
    },
}));
