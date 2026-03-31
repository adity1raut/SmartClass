import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly, such as your name, email address, and password when you register. We also collect usage data including pages visited, features used, quiz scores, and attendance records. For live classes, we process video and audio streams in real-time but do not store recordings unless explicitly enabled by the teacher.`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use collected data to provide and improve the SmartClass service, personalise your learning experience, send important notifications about classes and assignments, generate analytics for teachers, and comply with legal obligations. We do not sell your personal data to third parties.`,
  },
  {
    title: "3. Data Sharing",
    content: `We share data only with trusted service providers who help us operate the platform (cloud hosting, email delivery, analytics), your institution if you are enrolled through an institutional account, and law enforcement when required by applicable law. All third-party processors are bound by data processing agreements.`,
  },
  {
    title: "4. Cookies",
    content: `We use essential cookies to maintain your session and authentication state. With your consent, we use analytics cookies to understand how the platform is used. You can manage cookie preferences at any time from the Cookie Settings page.`,
  },
  {
    title: "5. Data Retention",
    content: `Account data is retained for as long as your account is active. Upon account deletion, personal data is removed within 30 days. Anonymised aggregate data may be retained for longer periods for research and product improvement purposes.`,
  },
  {
    title: "6. Your Rights",
    content: `Under GDPR and applicable privacy laws, you have the right to access, correct, or delete your personal data; the right to data portability; the right to object to or restrict processing; and the right to withdraw consent. To exercise these rights, contact us at privacy@smartclass.app.`,
  },
  {
    title: "7. Security",
    content: `We protect your data using TLS 1.3 encryption in transit, AES-256 encryption at rest, and regular third-party security audits. However, no system is 100% secure. If you discover a security vulnerability, please report it responsibly to security@smartclass.app.`,
  },
  {
    title: "8. Children's Privacy",
    content: `SmartClass may be used by students under 18 only under the supervision of a teacher or institution. We do not knowingly collect personal data directly from children under 13 without verifiable parental consent. Institutions are responsible for obtaining appropriate consents.`,
  },
  {
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or a prominent notice on the platform. Continued use of SmartClass after changes take effect constitutes acceptance of the updated policy.`,
  },
  {
    title: "10. Contact",
    content: `For privacy-related queries, contact our Data Protection Officer at privacy@smartclass.app or write to: SmartClass Privacy Team, c/o SmartClass Inc., 123 Learning Lane, San Francisco, CA 94105, USA.`,
  },
];

function Privacy() {
  const { themeName } = useContext(ThemeContext);

  return (
    <div
      data-theme={themeName}
      className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]"
    >
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
              Legal
            </span>
            <h1 className="text-4xl font-extrabold text-[var(--text)] mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Last updated: March 1, 2026
            </p>
          </div>

          <p className="text-sm text-[var(--muted)] leading-relaxed mb-10 p-5 rounded-xl border border-[var(--border)]/40 bg-[var(--card)]">
            SmartClass ("we", "us", or "our") is committed to protecting your
            privacy. This policy explains what data we collect, how we use it,
            and the controls you have over your information.
          </p>

          <div className="space-y-8">
            {SECTIONS.map((s) => (
              <div key={s.title}>
                <h2 className="text-base font-bold text-[var(--text)] mb-2">
                  {s.title}
                </h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {s.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Privacy;
