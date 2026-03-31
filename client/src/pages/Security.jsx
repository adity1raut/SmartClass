import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SECURITY_FEATURES = [
  {
    icon: "🔐",
    title: "End-to-End Encryption",
    desc: "All data in transit is encrypted with TLS 1.3. Sensitive data at rest uses AES-256 encryption.",
  },
  {
    icon: "🛡️",
    title: "Role-Based Access Control",
    desc: "Granular permissions ensure teachers, students, and admins only access what they're authorised to see.",
  },
  {
    icon: "🔑",
    title: "Secure Authentication",
    desc: "JWT-based auth with HTTP-only cookies, bcrypt password hashing, and optional multi-factor authentication.",
  },
  {
    icon: "📋",
    title: "GDPR Compliant",
    desc: "Full compliance with GDPR and FERPA. Users can request data export or deletion at any time.",
  },
  {
    icon: "🔍",
    title: "Audit Logs",
    desc: "Comprehensive activity logs track all critical actions for compliance and incident response.",
  },
  {
    icon: "🚦",
    title: "Rate Limiting & DDoS Protection",
    desc: "API rate limiting and upstream DDoS mitigation keep the platform available and responsive.",
  },
];

const COMPLIANCE = ["GDPR", "FERPA", "COPPA", "SOC 2 Type II", "ISO 27001"];

function Security() {
  const { themeName } = useContext(ThemeContext);

  return (
    <div
      data-theme={themeName}
      className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]"
    >
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
              Security
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] mb-4">
              Your data is safe with us
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
              SmartClass is built with security-first principles. We protect
              student and educator data at every layer.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {SECURITY_FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-[var(--border)]/40 bg-[var(--card)] hover:border-[var(--accent)]/40 transition-all duration-300"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-[var(--text)] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Compliance */}
          <div className="rounded-2xl border border-[var(--border)]/40 bg-[var(--card)] p-8 text-center">
            <h2 className="text-xl font-bold text-[var(--text)] mb-2">
              Compliance & Certifications
            </h2>
            <p className="text-sm text-[var(--muted)] mb-6">
              We meet the highest standards in data protection and privacy.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {COMPLIANCE.map((c) => (
                <span
                  key={c}
                  className="px-4 py-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-sm font-semibold text-[var(--accent)]"
                >
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Security;
