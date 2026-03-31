import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const POSTS = [
  {
    tag: "AI in Education",
    title: "How AI is Transforming the Modern Classroom",
    excerpt:
      "From adaptive learning paths to automated assessments, AI is giving teachers superpowers and helping every student learn at their own pace.",
    date: "March 20, 2026",
    readTime: "5 min read",
    emoji: "🤖",
  },
  {
    tag: "Product Update",
    title: "Introducing Live Class Analytics",
    excerpt:
      "We've rolled out real-time attendance tracking, participation scores, and engagement heatmaps inside live classes.",
    date: "March 12, 2026",
    readTime: "3 min read",
    emoji: "📊",
  },
  {
    tag: "Best Practices",
    title: "10 Tips for Running Effective Online Classes",
    excerpt:
      "Whether you're new to virtual teaching or a seasoned pro, these evidence-backed tips will help you engage your students and improve outcomes.",
    date: "February 28, 2026",
    readTime: "7 min read",
    emoji: "✅",
  },
  {
    tag: "Case Study",
    title: "How GreenValley College Doubled Completion Rates",
    excerpt:
      "After switching to SmartClass, GreenValley's course completion rate jumped from 47% to 91% in a single semester. Here's how they did it.",
    date: "February 14, 2026",
    readTime: "6 min read",
    emoji: "🏫",
  },
  {
    tag: "Security",
    title: "Our Commitment to Student Data Privacy",
    excerpt:
      "An in-depth look at how SmartClass protects your data — from encryption at rest to our GDPR-compliant deletion workflows.",
    date: "January 30, 2026",
    readTime: "4 min read",
    emoji: "🔒",
  },
  {
    tag: "Product Update",
    title: "Dark Mode, New Themes & Accessibility Improvements",
    excerpt:
      "SmartClass now ships with six beautiful themes, improved contrast ratios, and full keyboard-navigation support.",
    date: "January 15, 2026",
    readTime: "2 min read",
    emoji: "🎨",
  },
];

function Blog() {
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
              Blog
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] mb-4">
              Insights on education & technology
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
              Tips, updates, and stories from the SmartClass team.
            </p>
          </div>

          {/* Posts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post) => (
              <div
                key={post.title}
                className="flex flex-col p-6 rounded-2xl border border-[var(--border)]/40 bg-[var(--card)] hover:border-[var(--accent)]/40 hover:shadow-[0_8px_32px_-8px_var(--accent)] transition-all duration-300 group cursor-pointer"
              >
                <div className="text-4xl mb-4">{post.emoji}</div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
                  {post.tag}
                </span>
                <h3 className="text-sm font-bold text-[var(--text)] mb-2 leading-snug group-hover:text-[var(--accent)] transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed flex-1 mb-4">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[var(--muted)] font-medium">
                  <span>{post.date}</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Blog;
