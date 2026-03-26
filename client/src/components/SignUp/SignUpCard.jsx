import { useNavigate } from "react-router-dom";
import SignUpForm from "./SignUpForm";
import OtpStep from "./OtpStep";

function SignUpCard({ form, role, setRole, error, loading, otpEmail, setOtpEmail, onSubmit }) {
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
          <p className="text-xs text-[var(--muted)]">
            {otpEmail ? "Verify your email" : "Create your account"}
          </p>
        </div>
      </div>

      {otpEmail ? (
        <OtpStep email={otpEmail} role={role} onBack={() => setOtpEmail(null)} />
      ) : (
        <SignUpForm
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          role={role}
          setRole={setRole}
        />
      )}
    </div>
  );
}

export default SignUpCard;