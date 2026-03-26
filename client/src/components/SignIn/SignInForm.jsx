import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignInForm({ onSubmit, loading, error }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const field =
    "w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-sm " +
    "text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-all duration-200 " +
    "focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/12 hover:border-[var(--accent)]/40";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5 sc-input-wrap">
        <label className="block text-xs font-semibold text-[var(--muted)]">Email</label>
        <input
          className={field}
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-1.5 sc-input-wrap">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[var(--muted)]">Password</label>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-xs text-[var(--accent)] hover:underline bg-transparent border-none cursor-pointer active:opacity-70"
          >
            Forgot?
          </button>
        </div>
        <div className="relative">
          <input
            className={`${field} pr-12`}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 text-[var(--muted)] hover:text-[var(--accent)] bg-transparent border-none cursor-pointer active:opacity-70"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <ErrorMessage error={error} />

      <button
        type="submit"
        disabled={loading}
        className="sc-btn-primary w-full py-3 rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
      >
        {loading && <span className="sc-spinner" />}
        <span>{loading ? "Signing in…" : "Sign in"}</span>
      </button>
    </form>
  );
}

function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg animate-in fade-in duration-300">
      {error}
    </div>
  );
}

export default SignInForm;