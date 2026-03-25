import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function StudentDashboard({ user, onLogout }) {
  const navigate = useNavigate();
  const [enrolled, setEnrolled] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);

  const load = () => {
    fetch(`/api/students/${user.id}/dashboard`)
      .then((r) => r.json())
      .then((d) => setEnrolled(d.enrolledCourses || []));
    fetch("/api/courses")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setAllCourses(d));
  };

  useEffect(() => {
    load();
  }, [user.id]);

  const enroll = async (courseId) => {
    setEnrollingId(courseId);
    await fetch(`/api/courses/${courseId}/enroll`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: user.id }),
    });
    setEnrollingId(null);
    load();
  };

  const enrolledIds = enrolled.map((c) => c.id);
  const available = allCourses.filter((c) => !enrolledIds.includes(c.id));
  const totalCompleted = enrolled.reduce((s, c) => s + c.completedMaterials, 0);
  const totalQuizzes = enrolled.reduce((s, c) => s + c.quizzesTaken, 0);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-24 w-80 h-80 rounded-full bg-[var(--accent)]/15 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[var(--accent)]/10 blur-3xl animate-[pulse_10s_ease-in-out_infinite_2s]" />
      </div>

      <Navbar user={user} onLogout={onLogout} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 relative z-10">
        {/* Header Section */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-5xl">👋</div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text)]">
                Welcome back, {user.name.split(" ")[0]}!
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Your learning dashboard awaits
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            {
              icon: "📚",
              val: enrolled.length,
              label: "Enrolled",
              color: "from-blue-500/20 to-blue-600/10",
            },
            {
              icon: "✅",
              val: totalCompleted,
              label: "Completed",
              color: "from-emerald-500/20 to-emerald-600/10",
            },
            {
              icon: "🏆",
              val: totalQuizzes,
              label: "Quizzes",
              color: "from-amber-500/20 to-amber-600/10",
            },
          ].map((s, i) => (
            <div
              key={s.label}
              className={`group rounded-2xl border border-[var(--border)] bg-gradient-to-br ${s.color} p-6
                         shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-300
                         hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.25)] hover:-translate-y-1
                         animate-in fade-in slide-in-from-bottom-4 duration-500`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3
                            group-hover:scale-110 transition-transform duration-300 bg-white/10 backdrop-blur-sm"
              >
                {s.icon}
              </div>
              <div className="text-4xl font-bold text-[var(--text)] mb-1 font-mono">
                {s.val}
              </div>
              <p className="text-sm font-medium text-[var(--muted)]">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* My Courses Section */}
        {enrolled.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                  📖 My Learning Path
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Continue where you left off
                </p>
              </div>
              <span
                className="px-3.5 py-1.5 rounded-full bg-[var(--accent)]/12 text-[var(--accent)] text-xs font-bold
                             border border-[var(--accent)]/30 animate-pulse"
              >
                {enrolled.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolled.map((c, i) => (
                <div
                  key={c.id}
                  className="group rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6
                           shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-300
                           hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.25)] hover:-translate-y-2
                           hover:border-[var(--accent)]/40 overflow-hidden relative
                           animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent)]/0 
                               group-hover:from-[var(--accent)]/5 group-hover:to-[var(--accent)]/0 transition-all duration-300"
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-[var(--text)] flex-1 leading-tight group-hover:text-[var(--accent)] transition-colors">
                        {c.title}
                      </h3>
                      {c.subject && (
                        <span className="px-3 py-1 bg-[var(--accent)]/12 text-[var(--accent)] rounded-lg text-xs font-bold whitespace-nowrap ml-3">
                          {c.subject}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted)] mb-4 flex items-center gap-1.5">
                      👨‍🏫{" "}
                      <span className="font-medium">
                        {c.teacher?.name || "Unknown"}
                      </span>
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-5">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-[var(--muted)] font-medium">
                          Progress
                        </span>
                        <span className="font-bold text-[var(--accent)] bg-[var(--accent)]/12 px-2 py-0.5 rounded-md">
                          {c.progress || 0}%
                        </span>
                      </div>
                      <div className="h-2.5 bg-[var(--border)]/50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/70 rounded-full transition-all duration-500"
                          style={{ width: `${c.progress || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-[var(--muted)]">
                      <div className="p-2.5 rounded-lg bg-[var(--accent)]/6 border border-[var(--border)]/50">
                        <p className="font-semibold text-[var(--text)]">
                          {c.completedMaterials}/{c.materialCount}
                        </p>
                        <p className="text-[11px]">Materials</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[var(--accent)]/6 border border-[var(--border)]/50">
                        <p className="font-semibold text-[var(--text)]">
                          {c.quizzesTaken}/{c.quizCount}
                        </p>
                        <p className="text-[11px]">Quizzes</p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/course/${c.id}`)}
                      className="w-full py-3 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-300
                               bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 text-[var(--accent-contrast)]
                               shadow-[0_12px_24px_-12px_var(--accent)] hover:shadow-[0_16px_32px_-12px_var(--accent)]
                               hover:-translate-y-0.5 active:scale-95"
                    >
                      Continue Learning →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses Section */}
        {available.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                  🌟 Explore More
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Expand your skills with new courses
                </p>
              </div>
              <span
                className="px-3.5 py-1.5 rounded-full bg-emerald-500/12 text-emerald-600 text-xs font-bold
                             border border-emerald-500/30 animate-pulse"
              >
                {available.length} available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map((c, i) => (
                <div
                  key={c.id}
                  className="group rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6
                           shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-300
                           hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.25)] hover:-translate-y-2
                           hover:border-emerald-500/40 overflow-hidden relative
                           animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${(enrolled.length + i) * 80}ms` }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 
                               group-hover:from-emerald-500/5 group-hover:to-emerald-500/0 transition-all duration-300"
                  />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-bold text-[var(--text)] flex-1 leading-tight group-hover:text-emerald-600 transition-colors">
                        {c.title}
                      </h3>
                      {c.subject && (
                        <span className="px-3 py-1 bg-emerald-500/12 text-emerald-600 rounded-lg text-xs font-bold whitespace-nowrap ml-3">
                          {c.subject}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted)] mb-3 flex items-center gap-1.5">
                      👨‍🏫{" "}
                      <span className="font-medium">
                        {c.teacher?.name || "Unknown"}
                      </span>
                    </p>

                    <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed line-clamp-2">
                      {c.description ||
                        "Explore this amazing course and expand your knowledge"}
                    </p>

                    <div className="grid grid-cols-2 gap-2 mb-5 text-xs text-[var(--muted)]">
                      <div className="p-2.5 rounded-lg bg-emerald-500/6 border border-[var(--border)]/50">
                        <p className="font-semibold text-[var(--text)]">
                          {c.enrollmentCount || 0}
                        </p>
                        <p className="text-[11px]">Enrolled</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-500/6 border border-[var(--border)]/50">
                        <p className="font-semibold text-[var(--text)]">
                          {c.materialCount || 0}
                        </p>
                        <p className="text-[11px]">Materials</p>
                      </div>
                    </div>

                    <button
                      onClick={() => enroll(c.id)}
                      disabled={enrollingId === c.id}
                      className="w-full py-3 rounded-xl text-sm font-bold border-2 cursor-pointer disabled:cursor-not-allowed transition-all duration-300
                               bg-emerald-500/12 hover:bg-emerald-500/20 disabled:opacity-60 text-emerald-600 border-emerald-500/30
                               hover:shadow-[0_12px_24px_-12px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95"
                    >
                      {enrollingId === c.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                          Enrolling...
                        </span>
                      ) : (
                        "+ Enroll Now"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {enrolled.length === 0 && available.length === 0 && (
          <div className="text-center py-20 animate-in fade-in duration-500">
            <div className="text-8xl mb-4 animate-bounce">🎓</div>
            <h3 className="text-xl font-bold text-[var(--text)] mb-2">
              No Courses Yet
            </h3>
            <p className="text-[var(--muted)] text-sm max-w-md mx-auto">
              Your learning journey starts here! Ask your teacher to create or
              assign courses for you.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default StudentDashboard;
