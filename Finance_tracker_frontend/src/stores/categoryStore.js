import { create } from "zustand";
import { api } from "../lib/api.js";
import { useAuthStore } from "./authStore.js";

export const useCategoryStore = create((set, get) => ({
    categories: [],
    stats: [],
    loading: false,

    fetchCategories: async () => {
        const { accessToken } = useAuthStore.getState();
        set({ loading: true });
        try {
            const [catRes, statsRes] = await Promise.all([
                api.get("/api/v1/categories", { accessToken }),
                api.get("/api/v1/categories/stats", { accessToken }).catch(() => ({ data: [] })),
            ]);
            set({ categories: catRes.data || [], stats: statsRes.data || [] });
        } finally {
            set({ loading: false });
        }
    },

    createCategory: async (data) => {
        const { accessToken } = useAuthStore.getState();
        const res = await api.post("/api/v1/categories", data, { accessToken });
        await get().fetchCategories();
        return res.data;
    },

    updateCategory: async (id, data) => {
        const { accessToken } = useAuthStore.getState();
        await api.put(`/api/v1/categories/${id}`, data, { accessToken });
        await get().fetchCategories();
    },

    deleteCategory: async (id) => {
        const { accessToken } = useAuthStore.getState();
        await api.del(`/api/v1/categories/${id}`, { accessToken });
        await get().fetchCategories();
    },

    getStatForCategory: (id) => {
        return get().stats.find((s) => s.categoryId === id);
    },
}));
