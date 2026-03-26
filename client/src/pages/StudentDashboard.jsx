import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../socket";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashData, setDashData] = useState({
    enrolledCourses: [],
    pendingAssignments: 0,
    completedQuizzes: 0,
    totalEnrolled: 0,
    upcomingClasses: [],
    performanceData: [],
    progressData: [],
    timeSpentData: [],
  });
  const [allCourses, setAllCourses] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);
  const [unenrollingId, setUnenrollingId] = useState(null);
  const [confirmUnenroll, setConfirmUnenroll] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const dashResponse = await fetch(`/api/students/${user.id}/dashboard`);
      const dashDataRes = await dashResponse.json();
      if (!dashDataRes.error) {
        setDashData(dashDataRes);
      }

      const coursesResponse = await fetch("/api/courses");
      const coursesData = await coursesResponse.json();
      if (Array.isArray(coursesData)) {
        setAllCourses(coursesData);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      load();
      const socket = getSocket(user.id);
      socket.on("new-course", () => load());
      socket.on("live-class-scheduled", () => load());
      socket.on("dashboard-update", () => load());
      return () => {
        socket.off("new-course");
        socket.off("live-class-scheduled");
        socket.off("dashboard-update");
      };
    }
  }, [user?.id]);

  const enroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id, courseId }),
      });
      if (response.ok) {
        await load();
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
    } finally {
      setEnrollingId(null);
    }
  };

  const unenroll = async () => {
    if (!confirmUnenroll) return;
    setUnenrollingId(confirmUnenroll.id);
    try {
      const response = await fetch("/api/enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: user.id, courseId: confirmUnenroll.id }),
      });
      if (response.ok) {
        setConfirmUnenroll(null);
        await load();
      }
    } catch (error) {
      console.error("Unenrollment failed:", error);
    } finally {
      setUnenrollingId(null);
    }
  };

  const enrolled = dashData.enrolledCourses || [];
  const enrolledIds = enrolled.map((c) => c.id);
  const available = allCourses.filter((c) => !enrolledIds.includes(c.id));

  const stats = [
    { icon: "📚", val: dashData.totalEnrolled ?? enrolled.length, label: "Enrolled Courses", color: "from-blue-500/20 to-blue-600/10", accent: "blue" },
    { icon: "📋", val: dashData.pendingAssignments ?? 0, label: "Pending Assignments", color: "from-amber-500/20 to-amber-600/10", accent: "amber" },
    { icon: "🧠", val: dashData.completedQuizzes ?? 0, label: "Quizzes Completed", color: "from-purple-500/20 to-purple-600/10", accent: "purple" },
    { icon: "📹", val: dashData.upcomingClasses?.length ?? 0, label: "Upcoming Classes", color: "from-emerald-500/20 to-emerald-600/10", accent: "emerald" },
  ];

  const chartColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-20 -left-24 w-96 h-96 rounded-full bg-[var(--accent)]/20 blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[var(--accent)]/15 blur-3xl animate-[pulse_10s_ease-in-out_infinite_2s]" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-[pulse_12s_ease-in-out_infinite_1s]" />
      </div>

      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-6 duration-500">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-6xl drop-shadow-lg">👋</div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-[var(--text)]">
                Welcome back, {user?.name?.split(" ")[0] || "Student"}!
              </h1>
              <p className="text-sm text-[var(--muted)] mt-2 font-medium">Your personalized learning dashboard</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`group rounded-2xl border border-[var(--border)] bg-gradient-to-br ${s.color} p-6
                         shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-300
                         hover:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.25)] hover:-translate-y-2
                         animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-md`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4
                              group-hover:scale-125 transition-transform duration-300 bg-white/15 backdrop-blur-sm
                              group-hover:bg-white/25 shadow-lg">
                {s.icon}
              </div>
              <div className="text-4xl font-black text-[var(--text)] mb-2 font-mono tracking-tighter">{s.val}</div>
              <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {dashData.performanceData?.length > 0 || dashData.progressData?.length > 0 || dashData.timeSpentData?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Performance Chart */}
            {dashData.performanceData?.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6
                              shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md
                              animate-in fade-in slide-in-from-bottom-6 duration-700">
                <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                  📊 Performance Trend
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashData.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis stroke="var(--muted)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="var(--muted)" style={{ fontSize: "12px" }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--surface)", 
                        border: "1px solid var(--border)",
                        borderRadius: "8px"
                      }} 
                      cursor={{ stroke: "var(--accent)", strokeWidth: 2 }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Progress Chart */}
            {dashData.progressData?.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6
                              shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md
                              animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: "100ms" }}>
                <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                  🎯 Course Progress
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dashData.progressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis stroke="var(--muted)" style={{ fontSize: "12px" }} />
                    <YAxis stroke="var(--muted)" style={{ fontSize: "12px" }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "var(--surface)", 
                        border: "1px solid var(--border)",
                        borderRadius: "8px"
                      }}
                    />
                    <Legend />
                    <Bar dataKey="completion" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Time Spent Chart */}
            {dashData.timeSpentData?.length > 0 && (
              <div className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6
                              shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] backdrop-blur-md
                              animate-in fade-in slide-in-from-bottom-6 duration-700"
                style={{ animationDelay: "200ms" }}>
                <h3 className="text-lg font-bold text-[var(--text)] mb-4 flex items-center gap-2">
                  ⏱️ Time Spent by Course
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dashData.timeSpentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="hours"
                    >
                      {dashData.timeSpentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : null}

        {/* Upcoming Live Classes */}
        {dashData.upcomingClasses?.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-4 flex items-center gap-2">
              <span className="text-3xl">📹</span> Upcoming Live Classes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashData.upcomingClasses.slice(0, 3).map((lc, i) => (
                <div
                  key={lc.id}
                  className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-5 
                           shadow-[0_8px_16px_-8px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300
                           hover:shadow-[0_12px_24px_-12px_rgba(0,0,0,0.2)] hover:-translate-y-1
                           animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                      lc.status === "live"
                        ? "bg-red-500/20 text-red-600 animate-pulse border border-red-500/30"
                        : "bg-blue-500/20 text-blue-600 border border-blue-500/30"
                    }`}>
                      {lc.status === "live" ? "🔴 LIVE" : "🗓️ Scheduled"}
                    </span>
                    <span className="text-xs text-[var(--muted)] font-medium">
                      {new Date(lc.scheduledAt).toLocaleDateString()} · {new Date(lc.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text)] mb-2 line-clamp-2">{lc.title}</p>
                  {lc.course?.title && (
                    <p className="text-xs text-[var(--muted)] mb-3 font-medium">📚 {lc.course.title}</p>
                  )}
                  {lc.meetingLink && (
                    <a
                      href={lc.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-semibold text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors"
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Courses */}
        {enrolled.length > 0 && (
          <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                  <span className="text-3xl">📖</span> My Learning Path
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1 font-medium">Continue where you left off</p>
              </div>
              <span className="px-4 py-2 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-bold
                               border border-[var(--accent)]/30 shadow-lg">
                {enrolled.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolled.map((c, i) => (
                <div
                  key={c.id}
                  className="group rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6
                           shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-300
                           hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.25)] hover:-translate-y-2
                           hover:border-[var(--accent)]/50 overflow-hidden relative backdrop-blur-md
                           animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent)]/0
                                 group-hover:from-[var(--accent)]/8 group-hover:to-[var(--accent)]/0 transition-all duration-300" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <h3 className="text-lg font-bold text-[var(--text)] flex-1 leading-snug group-hover:text-[var(--accent)] transition-colors">
                        {c.title}
                      </h3>
                      {c.subject && (
                        <span className="px-3 py-1 bg-[var(--accent)]/15 text-[var(--accent)] rounded-lg text-xs font-bold whitespace-nowrap">
                          {c.subject}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted)] mb-4 flex items-center gap-1.5 font-medium">
                      👨‍🏫 {c.teacher?.name || "Unknown"}
                    </p>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 text-center transition-all group-hover:border-blue-500/40">
                        <p className="font-bold text-[var(--text)] text-lg">{c.materialCount || 0}</p>
                        <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">Materials</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 text-center transition-all group-hover:border-amber-500/40">
                        <p className="font-bold text-[var(--text)] text-lg">{c.assignmentCount || 0}</p>
                        <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">Assignments</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 text-center transition-all group-hover:border-purple-500/40">
                        <p className="font-bold text-[var(--text)] text-lg">{c.quizCount || 0}</p>
                        <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">Quizzes</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/course/${c.id}`)}
                        className="flex-1 py-3 rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-300
                                 bg-gradient-to-r from-[var(--accent)] to-[var(--accent)]/80 text-white
                                 shadow-[0_8px_16px_-8px_var(--accent)] hover:shadow-[0_12px_28px_-8px_var(--accent)]
                                 hover:-translate-y-1 active:scale-95"
                      >
                        Open Course →
                      </button>
                      <button
                        onClick={() => setConfirmUnenroll(c)}
                        className="px-3 py-3 rounded-xl text-sm font-bold border-2 border-red-500/30 bg-red-500/10 
                                   hover:bg-red-500/20 text-red-600 cursor-pointer transition-all duration-300
                                   hover:border-red-500/50"
                        title="Unenroll"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Courses */}
        {available.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
                  <span className="text-3xl">🌟</span> Explore More
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1 font-medium">Expand your skills with new courses</p>
              </div>
              <span className="px-4 py-2 rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold
                               border border-emerald-500/30 shadow-lg">
                {available.length} available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {available.map((c, i) => (
                <div
                  key={c.id}
                  className="group rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_92%,transparent)] p-6
                           shadow-[0_8px_32px_-12px_rgba(0,0,0,0.15)] transition-all duration-300
                           hover:shadow-[0_20px_48px_-16px_rgba(0,0,0,0.25)] hover:-translate-y-2
                           hover:border-emerald-500/50 overflow-hidden relative backdrop-blur-md
                           animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationDelay: `${(enrolled.length + i) * 80}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0
                                 group-hover:from-emerald-500/8 group-hover:to-emerald-500/0 transition-all duration-300" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <h3 className="text-lg font-bold text-[var(--text)] flex-1 leading-snug group-hover:text-emerald-600 transition-colors">
                        {c.title}
                      </h3>
                      {c.subject && (
                        <span className="px-3 py-1 bg-emerald-500/15 text-emerald-600 rounded-lg text-xs font-bold whitespace-nowrap">
                          {c.subject}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted)] mb-3 flex items-center gap-1.5 font-medium">
                      👨‍🏫 {c.teacher?.name || "Unknown"}
                    </p>

                    <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed line-clamp-2 font-medium">
                      {c.description || "Explore this amazing course and expand your knowledge"}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                        <p className="font-bold text-[var(--text)] text-lg">{c.enrollmentCount || 0}</p>
                        <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">Enrolled</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                        <p className="font-bold text-[var(--text)] text-lg">{c.materialCount || 0}</p>
                        <p className="text-xs text-[var(--muted)] font-semibold mt-0.5">Materials</p>
                      </div>
                    </div>

                    <button
                      onClick={() => enroll(c.id)}
                      disabled={enrollingId === c.id}
                      className="w-full py-3 rounded-xl text-sm font-bold border-2 cursor-pointer disabled:cursor-not-allowed transition-all duration-300
                               bg-emerald-500/12 hover:bg-emerald-500/25 disabled:opacity-60 text-emerald-600 border-emerald-500/40
                               hover:shadow-[0_12px_24px_-12px_rgba(16,185,129,0.4)] hover:-translate-y-1 active:scale-95"
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

        {/* Empty state */}
        {enrolled.length === 0 && available.length === 0 && !loading && (
          <div className="text-center py-24 animate-in fade-in duration-500">
            <div className="text-8xl mb-4 drop-shadow-lg">🎓</div>
            <h3 className="text-2xl font-bold text-[var(--text)] mb-3">No Courses Yet</h3>
            <p className="text-[var(--muted)] text-base max-w-md mx-auto font-medium">
              Your learning journey starts here! Ask your teacher to create courses for you.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        )}
      </div>

      <Footer />

      {/* Unenroll confirmation modal */}
      {confirmUnenroll && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setConfirmUnenroll(null)}
        >
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 w-full max-w-sm shadow-2xl text-center
                          animate-in fade-in zoom-in-95 duration-300">
            <div className="text-5xl mb-4 drop-shadow-lg">⚠️</div>
            <h3 className="text-xl font-bold text-[var(--text)] mb-3">Unenroll from course?</h3>
            <p className="text-sm text-[var(--muted)] mb-7 font-medium">
              You will lose access to <strong className="text-[var(--text)]">"{confirmUnenroll.title}"</strong>.
              You can re-enroll at any time.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmUnenroll(null)}
                className="px-6 py-3 bg-[var(--bg)] hover:bg-[var(--border)]/50 text-[var(--text)] rounded-lg text-sm font-bold 
                           border border-[var(--border)] cursor-pointer transition-all duration-300 hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={unenroll}
                disabled={unenrollingId === confirmUnenroll.id}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-[0_8px_16px_-4px_rgba(239,68,68,0.4)] 
                           disabled:opacity-60 text-white rounded-lg text-sm font-bold border-none cursor-pointer transition-all duration-300"
              >
                {unenrollingId === confirmUnenroll.id ? "Leaving..." : "Unenroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
