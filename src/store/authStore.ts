import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Profile {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  photo: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  profile: Profile;
  init: () => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

const defaultProfile: Profile = {
  name: "",
  email: "",
  phone: "",
  location: "",
  role: "Owner",
  photo: null,
};

async function loadProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error || !data) return defaultProfile;
  return {
    name: data.name ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    location: data.location ?? "",
    role: data.role ?? "Owner",
    photo: data.photo_url ?? null,
  };
}

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  profile: defaultProfile,

  init: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const profile = await loadProfile(data.session.user.id);
      set({ isAuthenticated: true, profile, isLoading: false });
    } else {
      set({ isAuthenticated: false, isLoading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id);
        set({ isAuthenticated: true, profile });
      } else {
        set({ isAuthenticated: false, profile: defaultProfile });
      }
    });
  },

  register: async ({ name, email, password }) => {
    set({ authError: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      set({ authError: error.message });
      return false;
    }
    if (data.user) {
      // Baris profil dibuat otomatis lewat trigger database (lihat supabase/schema.sql)
      const profile = { ...defaultProfile, name, email };
      set({ isAuthenticated: true, profile });
    }
    return true;
  },

  login: async (email, password) => {
    set({ authError: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ authError: error.message });
      return false;
    }
    if (data.user) {
      const profile = await loadProfile(data.user.id);
      set({ isAuthenticated: true, profile });
    }
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, profile: defaultProfile });
  },

  updateProfile: async (patch) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    set((state) => ({ profile: { ...state.profile, ...patch } })); // optimistic
    const { error } = await supabase
      .from("profiles")
      .update({
        name: patch.name,
        email: patch.email,
        phone: patch.phone,
        location: patch.location,
      })
      .eq("id", userData.user.id);
    if (error) console.error("[profile] update error:", error.message);
  },

  uploadAvatar: async (file) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const path = `${userData.user.id}/avatar-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (uploadError) {
      console.error("[avatar] upload error:", uploadError.message);
      return;
    }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const photoUrl = urlData.publicUrl;
    set((state) => ({ profile: { ...state.profile, photo: photoUrl } }));
    await supabase.from("profiles").update({ photo_url: photoUrl }).eq("id", userData.user.id);
  },
}));
