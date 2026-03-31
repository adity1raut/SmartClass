import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ENTERPRISE_FEATURES = [
  {
    icon: "🏛️",
    title: "Custom Branding",
    desc: "White-label SmartClass with your institution's logo, colours, and domain.",
  },
  {
    icon: "🔗",
    title: "SSO & LDAP Integration",
    desc: "Connect to your existing identity provider — Active Directory, Okta, Google Workspace, and more.",
  },
  {
    icon: "📊",
    title: "Advanced Analytics",
    desc: "Institution-wide dashboards with custom reports, cohort analysis, and data exports.",
  },
  {
    icon: "👨‍💼",
    title: "Dedicated Support",
    desc: "A named account manager and 24/7 priority support channel with guaranteed SLAs.",
  },
  {
    icon: "🖥️",
    title: "On-Premise Deployment",
    desc: "Deploy SmartClass on your own infrastructure for maximum control and data sovereignty.",
  },
  {
    icon: "🔧",
    title: "API & Integrations",
    desc: "Full REST API access plus pre-built integrations with LMS, SIS, and HR systems.",
  },
];

function Enterprise() {
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
              Enterprise
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] mb-4">
              Built for institutions at scale
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
              SmartClass Enterprise gives schools, colleges, and training
              organisations the power, flexibility, and control they need.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {ENTERPRISE_FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl border border-[var(--border)]/40 bg-[var(--card)] hover:border-[var(--accent)]/40 hover:shadow-[0_8px_32px_-8px_var(--accent)] transition-all duration-300 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-base font-bold text-[var(--text)] mb-2 group-hover:text-[var(--accent)] transition-colors duration-300">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-10 text-center">
            <h2 className="text-2xl font-extrabold text-[var(--text)] mb-3">
              Ready to transform your institution?
            </h2>
            <p className="text-[var(--muted)] mb-6 max-w-md mx-auto">
              Get a personalised demo and a custom quote tailored to your
              organisation's needs.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0_4px_20px_-4px_var(--accent)]"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Enterprise;
