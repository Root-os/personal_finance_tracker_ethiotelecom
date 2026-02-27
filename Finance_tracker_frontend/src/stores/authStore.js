import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "../lib/api.js";

/**
 * Central auth store — single source of truth for authentication state.
 * Persists only the accessToken to localStorage.
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      /* ── state ── */
      accessToken: "",
      currentSid: null,
      me: null,
      loading: false,
      hydrating: true,
      sessions: [],
      sessionsLoading: false,

      /* ── setters ── */
      setAccessToken: (token) => set({ accessToken: token || "" }),

      /* ── hydration (called once on app boot) ── */
      hydrateMe: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ me: null, hydrating: false });
          return;
        }
        try {
          const res = await api.get("/api/v1/users/me", { accessToken });
          set({ me: res.data || null, hydrating: false });
        } catch {
          set({ me: null, accessToken: "", hydrating: false });
        }
      },

      /* ── login ── */
      login: async ({ userName, password }) => {
        set({ loading: true });
        try {
          const res = await api.post(
            "/api/v1/auth/login",
            { userName, password },
            { retry: false }
          );
          const token = res.data?.tokens?.accessToken;
          const sid = res.data?.tokens?.sid || res.data?.sid;
          set({
            accessToken: token || "",
            currentSid: sid || null,
            me: res.data?.user || null
          });
          return res;
        } finally {
          set({ loading: false });
        }
      },

      /* ── register ── */
      register: async ({ name, userName, email, password }) => {
        set({ loading: true });
        try {
          const res = await api.post(
            "/api/v1/auth/register",
            { name, userName, email, password },
            { retry: false }
          );
          const token = res.data?.tokens?.accessToken;
          const sid = res.data?.tokens?.sid || res.data?.sid;
          if (token) {
            set({
              accessToken: token,
              currentSid: sid || null,
              me: res.data?.user || null
            });
          }
          return res;
        } finally {
          set({ loading: false });
        }
      },

      /* ── email verification ── */
      verifyEmail: async (token) => {
        set({ loading: true });
        try {
          const res = await api.post(
            "/api/v1/auth/verify-email",
            { token },
            { retry: false }
          );
          return res;
        } finally {
          set({ loading: false });
        }
      },

      resendVerification: async (email) => {
        set({ loading: true });
        try {
          const res = await api.post(
            "/api/v1/auth/resend-verification",
            { email },
            { retry: false }
          );
          return res;
        } finally {
          set({ loading: false });
        }
      },

      /* ── password reset ── */
      forgotPassword: async (email) => {
        set({ loading: true });
        try {
          const res = await api.post(
            "/api/v1/password-reset/request",
            { email },
            { retry: false }
          );
          return res;
        } finally {
          set({ loading: false });
        }
      },

      verifyResetToken: async (token) => {
        return await api.get(
          `/api/v1/password-reset/verify/${encodeURIComponent(token)}`,
          { retry: false }
        );
      },

      resetPassword: async (token, password) => {
        set({ loading: true });
        try {
          const res = await api.post(
            "/api/v1/password-reset/reset",
            { token, password },
            { retry: false }
          );
          return res;
        } finally {
          set({ loading: false });
        }
      },

      /* ── sessions ── */
      fetchSessions: async () => {
        const { accessToken } = get();
        if (!accessToken) return;
        set({ sessionsLoading: true });
        try {
          const res = await api.get("/api/v1/sessions", { accessToken });
          set({ sessions: res.data || [] });
        } finally {
          set({ sessionsLoading: false });
        }
      },

      revokeSession: async (sessionId) => {
        const { accessToken } = get();
        await api.del(`/api/v1/sessions/${sessionId}`, { accessToken });
        set((s) => ({
          sessions: s.sessions.filter((sess) => sess.id !== sessionId),
        }));
      },

      /* ── logout ── */
      logout: async () => {
        try {
          await api.post("/api/v1/auth/logout", {}, { retry: false });
        } finally {
          set({ accessToken: "", currentSid: null, me: null, sessions: [] });
        }
      },

      logoutAll: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ accessToken: "", currentSid: null, me: null, sessions: [] });
          return;
        }
        try {
          await api.post(
            "/api/v1/auth/logout-all",
            {},
            { accessToken, retry: false }
          );
        } finally {
          set({ accessToken: "", currentSid: null, me: null, sessions: [] });
        }
      },
    }),
    {
      name: "pft_auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        currentSid: s.currentSid
      }),
    }
  )
);
