import { useNavigate } from "react-router-dom";
import BrandHeader from "./BrandHeader";
import SignInForm from "./SignInForm";

function SignInCard({ onSubmit, loading, error }) {
  const navigate = useNavigate();

  return (
    <div
      className="rounded-2xl bg-[color-mix(in_srgb,var(--surface)_84%,transparent)] border border-[var(--border)] overflow-hidden shadow-[0_12px_44px_rgba(0,0,0,0.14)] sc-card p-8 animate-in fade-in slide-in-from-right-8 duration-700"
      style={{ animationDelay: "200ms" }}
    >
      <div className="flex items-center gap-3 lg:hidden mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center text-lg bg-[var(--accent)] text-[var(--accent-contrast)]">
          🎓
        </div>
        <div>
          <p className="sc-title text-xl font-bold text-[var(--text)]">SmartClass</p>
          <p className="text-xs text-[var(--muted)]">Sign in to your account</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[var(--text)] mb-1 sc-title">Welcome back</h2>
      <p className="text-sm text-[var(--muted)] mb-6">Sign in to continue learning</p>

      <SignInForm onSubmit={onSubmit} loading={loading} error={error} />

      <p className="text-center text-xs text-[var(--muted)] mt-6">
        Don&apos;t have an account?{" "}
        <button
          onClick={() => navigate("/signup")}
          className="text-[var(--accent)] font-semibold hover:underline bg-transparent border-none cursor-pointer active:opacity-70"
        >
          Create one
        </button>
      </p>
    </div>
  );
}

export default SignInCard;