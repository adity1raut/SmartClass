import { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleSelector from "./RoleSelector";
import ErrorMessage from "./ErrorMessage";

function SignUpForm({ onSubmit, loading, error, role, setRole }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const field =
    "w-full px-3.5 py-2.5 rounded-xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] text-sm " +
    "text-[var(--text)] placeholder:text-[var(--muted)] outline-none transition-all duration-200 " +
    "focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/12 hover:border-[var(--accent)]/40";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ form, role });
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-[var(--text)] mb-1 sc-title">Get started</h2>
      <p className="text-sm text-[var(--muted)] mb-6">Join thousands of learners today</p>

      <RoleSelector role={role} setRole={setRole} />

      <ErrorMessage error={error} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 sc-input-wrap">
          <label className="block text-xs font-semibold text-[var(--muted)]">Full name</label>
          <input
            className={field}
            type="text"
            placeholder="Your full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

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
          <label className="block text-xs font-semibold text-[var(--muted)]">Password</label>
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

        <button
          type="submit"
          disabled={loading}
          className="sc-btn-primary w-full py-3 rounded-xl text-sm font-semibold border-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
        >
          {loading && <span className="sc-spinner" />}
          <span>{loading ? "Sending code…" : "Create account"}</span>
        </button>
      </form>

      <p className="text-center text-xs text-[var(--muted)] mt-6">
        Already have an account?{" "}
        <button
          onClick={() => navigate("/signin")}
          className="text-[var(--accent)] font-semibold hover:underline bg-transparent border-none cursor-pointer active:opacity-70"
        >
          Sign in
        </button>
      </p>

      <p className="text-center text-xs text-[var(--muted)] mt-4">
        By signing up you agree to our{" "}
        <button
          onClick={() => navigate("/terms")}
          className="text-[var(--accent)] hover:underline bg-transparent border-none cursor-pointer active:opacity-70"
        >
          Terms
        </button>{" "}
        and{" "}
        <button
          onClick={() => navigate("/privacy")}
          className="text-[var(--accent)] hover:underline bg-transparent border-none cursor-pointer active:opacity-70"
        >
          Privacy Policy
        </button>
      </p>
    </>
  );
}

export default SignUpForm;