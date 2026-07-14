import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const register = useAuthStore((s) => s.register);
  const login = useAuthStore((s) => s.login);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async () => {
    setError("");
    if (!isSupabaseConfigured) {
      setError("Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di file .env.");
      return;
    }
    if (isRegister) {
      if (!name.trim() || !email.trim() || password.length < 6) {
        setError("Lengkapi nama, email, dan password minimal 6 karakter.");
        return;
      }
      setSubmitting(true);
      const ok = await register({ name: name.trim(), email: email.trim(), password });
      setSubmitting(false);
      if (ok) setCheckEmail(true);
      else setError(useAuthStore.getState().authError || "Gagal mendaftar.");
    } else {
      if (!email.trim() || !password) {
        setError("Masukkan email dan password Anda.");
        return;
      }
      setSubmitting(true);
      const ok = await login(email.trim(), password);
      setSubmitting(false);
      if (!ok) setError(useAuthStore.getState().authError || "Email atau password salah.");
    }
  };

  if (checkEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-secondary-50 px-4 dark:from-secondary-950 dark:via-surface-dark dark:to-secondary-900">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm rounded-3xl border border-secondary-100 bg-white p-8 text-center shadow-soft dark:border-secondary-800 dark:bg-secondary-900"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow">
            <Sparkles size={22} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-secondary-900 dark:text-white">Cek Email Kamu</h1>
          <p className="mt-2 text-sm text-secondary-500">
            Kami sudah kirim link konfirmasi ke <strong>{email}</strong>. Klik link itu untuk mengaktifkan akun, lalu masuk.
          </p>
          <Button className="mt-5 w-full" onClick={() => { setCheckEmail(false); setMode("login"); }}>
            Kembali ke Halaman Masuk
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-surface to-secondary-50 px-4 dark:from-secondary-950 dark:via-surface-dark dark:to-secondary-900">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-3xl border border-secondary-100 bg-white p-8 shadow-soft dark:border-secondary-800 dark:bg-secondary-900"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow">
            <Sparkles size={22} />
          </div>
          <h1 className="mt-4 text-lg font-bold text-secondary-900 dark:text-white">
            {isRegister ? "Buat Akun Nopa Finance OS" : "Masuk ke Nopa Finance OS"}
          </h1>
          <p className="mt-1 text-xs text-secondary-400">
            {isRegister
              ? "Satu akun untuk mengelola seluruh data keuangan Anda, tersimpan aman di cloud."
              : "Masukkan email dan password Anda untuk melanjutkan."}
          </p>
        </div>

        <div className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-secondary-500">Nama Lengkap</label>
              <Input placeholder="Nama Anda" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Email</label>
            <Input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-secondary-500">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-danger-50 px-3 py-2 text-xs text-danger-600 dark:bg-danger-500/10">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Memproses..." : isRegister ? "Buat Akun & Masuk" : "Masuk"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setMode(isRegister ? "login" : "register");
              setError("");
            }}
            className="w-full text-center text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            {isRegister ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar"}
          </button>
        </div>

        <p className="mt-5 text-center text-[11px] text-secondary-400">
          Data tersimpan aman di Supabase — bisa diakses dari device manapun.
        </p>
      </motion.div>
    </div>
  );
}
