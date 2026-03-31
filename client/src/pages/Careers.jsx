import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OPENINGS = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "AI/ML Engineer",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Product Designer (UI/UX)",
    team: "Design",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Customer Success Manager",
    team: "Customer Success",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Education Partnerships Lead",
    team: "Business Development",
    location: "Remote",
    type: "Full-time",
  },
  {
    title: "Technical Writer",
    team: "Documentation",
    location: "Remote",
    type: "Contract",
  },
];

const PERKS = [
  { icon: "🌍", text: "Fully remote team" },
  { icon: "💰", text: "Competitive salary & equity" },
  { icon: "🏖️", text: "Unlimited PTO" },
  { icon: "📚", text: "$1,500 learning budget" },
  { icon: "🖥️", text: "Home office stipend" },
  { icon: "🩺", text: "Health & wellness coverage" },
];

function Careers() {
  const { themeName } = useContext(ThemeContext);

  return (
    <div
      data-theme={themeName}
      className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]"
    >
      <Navbar />

      <main className="flex-1 px-4 sm:px-6 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
              Careers
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] mb-4">
              Join the SmartClass team
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
              We're building the future of education. Come help us do it.
            </p>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-16">
            {PERKS.map((p) => (
              <div
                key={p.text}
                className="flex items-center gap-3 p-4 rounded-xl border border-[var(--border)]/40 bg-[var(--card)] text-sm text-[var(--muted)]"
              >
                <span className="text-xl">{p.icon}</span>
                {p.text}
              </div>
            ))}
          </div>

          {/* Job Openings */}
          <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
            Open Positions
          </h2>
          <div className="space-y-4">
            {OPENINGS.map((job) => (
              <div
                key={job.title}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-[var(--border)]/40 bg-[var(--card)] hover:border-[var(--accent)]/40 transition-all duration-300 group"
              >
                <div>
                  <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors duration-300 mb-1">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                    <span>{job.team}</span>
                    <span>·</span>
                    <span>{job.location}</span>
                    <span>·</span>
                    <span>{job.type}</span>
                  </div>
                </div>
                <button className="shrink-0 px-5 py-2 rounded-xl border border-[var(--accent)]/40 text-sm font-semibold text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-all duration-300">
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          {/* No Fit? */}
          <div className="mt-10 p-6 rounded-2xl border border-[var(--border)]/40 bg-[var(--card)] text-center">
            <p className="text-sm text-[var(--muted)]">
              Don't see a role that fits?{" "}
              <a
                href="/contact"
                className="text-[var(--accent)] font-semibold hover:underline"
              >
                Send us your CV
              </a>{" "}
              and we'll keep you in mind for future openings.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Careers;
