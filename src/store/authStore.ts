import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  photo: string | null;
}

interface AuthState {
  hasAccount: boolean;
  isAuthenticated: boolean;
  profile: Profile;
  passwordHash: string | null;
  register: (data: { name: string; email: string; password: string }) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<Profile>) => void;
}

const defaultProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  role: "Owner",
  photo: null,
};

// NOTE: this is a client-side demo auth (no backend). Password is stored as a
// simple encoded string purely to gate local access, not for real security.
function encode(pw: string) {
  return btoa(unescape(encodeURIComponent(pw)));
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      hasAccount: false,
      isAuthenticated: false,
      profile: defaultProfile,
      passwordHash: null,
      register: ({ name, email, password }) =>
        set({
          hasAccount: true,
          isAuthenticated: true,
          passwordHash: encode(password),
          profile: { ...defaultProfile, name, email },
        }),
      login: (email, password) => {
        const state = get();
        const ok =
          state.hasAccount &&
          state.profile.email.trim().toLowerCase() === email.trim().toLowerCase() &&
          state.passwordHash === encode(password);
        if (ok) set({ isAuthenticated: true });
        return ok;
      },
      logout: () => set({ isAuthenticated: false }),
      updateProfile: (data) =>
        set((state) => ({ profile: { ...state.profile, ...data } })),
    }),
    { name: "nopa-finance-os-auth" }
  )
);
