import { create } from "zustand";
import { api } from "../lib/api.js";
import { useAuthStore } from "./authStore.js";

export const useAnalyticsStore = create((set) => ({
    summary: null,
    trends: [],
    categoryBreakdown: [],
    topExpenses: [],
    quickStats: null,
    loading: false,

    fetchDashboard: async () => {
        const { accessToken } = useAuthStore.getState();
        set({ loading: true });
        try {
            const [sumRes, quickRes] = await Promise.all([
                api.get("/api/v1/dashboard/stats", { accessToken }),
                api.get("/api/v1/dashboard/quick-stats", { accessToken }),
            ]);
            set({ summary: sumRes.data, quickStats: quickRes.data });
        } finally {
            set({ loading: false });
        }
    },

    fetchAnalytics: async (period) => {
        const { accessToken } = useAuthStore.getState();
        set({ loading: true });
        try {
            const [sumRes, trendRes, catRes, topRes] = await Promise.all([
                api.get(`/api/v1/analytics/summary?period=${period}`, { accessToken }),
                api.get(`/api/v1/analytics/trends?period=${period}`, { accessToken }).catch(() => ({ data: [] })),
                api.get(`/api/v1/analytics/categories?period=${period}`, { accessToken }).catch(() => ({ data: [] })),
                api.get(`/api/v1/analytics/top-expenses?period=${period}&limit=5`, { accessToken }).catch(() => ({ data: [] })),
            ]);
            set({
                summary: sumRes.data,
                trends: trendRes.data || [],
                categoryBreakdown: catRes.data || [],
                topExpenses: topRes.data || [],
            });
        } finally {
            set({ loading: false });
        }
    },

    runBudget: async (budgetAmount) => {
        const { accessToken } = useAuthStore.getState();
        const res = await api.post("/api/v1/analytics/budget", { monthlyBudget: Number(budgetAmount) }, { accessToken });
        return res.data;
    },
}));
