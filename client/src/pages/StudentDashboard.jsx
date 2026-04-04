import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../utils/api.js";
import { getSocket } from "../socket";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { GraduationCap } from "lucide-react";
import { Brain, ClipboardList, Clock, Calendar, FileText } from "lucide-react";
import { BookOpen,Video } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  MessageCircle,
  CalendarDays,
  Lightbulb,
  BarChart3,
  BrainCircuit,
  Sparkles
} from "lucide-react";

function SdAiMarkdown({ text }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-base font-bold text-[var(--text)] mt-4 mb-2">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-sm font-bold text-[var(--text)] mt-3 mb-1">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold text-[var(--accent)] mt-3 mb-0.5">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-sm leading-relaxed text-[var(--text)] mb-1.5">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-[var(--text)]">
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic text-[var(--muted)]">{children}</em>
        ),
        ul: ({ children }) => (
          <ul className="list-none space-y-1 my-1.5 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-1.5 pl-1 text-sm text-[var(--text)]">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="text-sm text-[var(--text)] flex gap-2 items-start">
            <span className="text-[var(--accent)] shrink-0">•</span>
            <span>{children}</span>
          </li>
        ),
        code: ({ className, children }) =>
          className ? (
            <code
              className={`text-xs font-mono text-[var(--text)] whitespace-pre-wrap ${className}`}
            >
              {children}
            </code>
          ) : (
            <code className="px-1 py-0.5 rounded bg-[var(--border)]/30 text-[var(--accent)] text-xs font-mono">
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre className="my-2 p-3 rounded-lg bg-[var(--border)]/20 border border-[var(--border)]/40 overflow-x-auto text-xs font-mono">
            {children}
          </pre>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-1.5 pl-3 border-l-4 border-[var(--accent)]/50 text-[var(--muted)] italic text-sm">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-2">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-[var(--border)]/20">{children}</thead>
        ),
        th: ({ children }) => (
          <th className="px-2 py-1.5 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wider border border-[var(--border)]/30">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-2 py-1.5 text-sm text-[var(--text)] border border-[var(--border)]/20">
            {children}
          </td>
        ),
        hr: () => <hr className="my-3 border-[var(--border)]/30" />,
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline underline-offset-2 hover:opacity-80"
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  );
}

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

  // AI state
  const [aiModal, setAiModal] = useState(null); // 'chat' | 'plan' | 'explain' | 'performance'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [explainForm, setExplainForm] = useState({
    concept: "",
    difficulty_level: "intermediate",
    course_context: "",
  });
  const [planForm, setPlanForm] = useState({
    student_name: "",
    enrolled_courses: "",
    weak_areas: "",
    available_hours_per_week: 10,
    goals: "",
  });
  const [perfForm, setPerfForm] = useState({
    subject: "",
    quiz_scores: "",
    assignment_grades: "",
    course_progress: 0,
  });
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const chatBottomRef = useRef(null);
  const aiResultRef = useRef(null);

  // Quiz state
  const [activeQuizzes, setActiveQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [quizModal, setQuizModal] = useState(null); // the quiz object being taken
  const [quizAnswers, setQuizAnswers] = useState({}); // { questionIndex: selectedOption }
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Assignment state
  const [myAssignments, setMyAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [submitModal, setSubmitModal] = useState(null); // assignment object
  const [submitContent, setSubmitContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mySubmission, setMySubmission] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);

  // DB-integrated state
  const [planSaving, setPlanSaving] = useState(false);
  const [planSaved, setPlanSaved] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [perfLoadingReal, setPerfLoadingReal] = useState(false);
  const [perfContext, setPerfContext] = useState(null); // real performance data from DB

  const openAiModal = (type) => {
    if (!user?.id) return;

    setAiModal(type);
    setAiResult(null);
    setAiError("");
    setPlanSaved(false);

    if (type === "chat") {
      setChatInput("");
      setAiError("");
    }

    if (type === "explain") {
      setExplainForm((f) => ({
        ...f,
        concept: f.concept || "",
        difficulty_level: f.difficulty_level || "intermediate",
        course_context: f.course_context || "",
      }));
    }

    if (type === "performance") {
      setPerfForm((f) => ({
        ...f,
        subject: f.subject || "",
        quiz_scores: f.quiz_scores || "",
        assignment_grades: f.assignment_grades || "",
        course_progress: f.course_progress || 0,
      }));
    }

    if (type === "plan") {
      setPlanForm((f) => ({
        ...f,
        student_name: f.student_name || user?.name || "",
        enrolled_courses: enrolled.map((c) => c.title).join(", "),
      }));
      if (!plansLoaded) {
        apiFetch(`/api/ai/students/${user.id}/study-plans`, {
          credentials: "include",
        })
          .then((r) => r.json())
          .then((d) => {
            if (Array.isArray(d)) {
              setSavedPlans(d);
              setPlansLoaded(true);
            }
          })
          .catch(() => {});
      }
    }
    if (type === "performance" && !perfContext) {
      apiFetch(`/api/ai/students/${user.id}/performance-context`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((d) => d.courses && setPerfContext(d))
        .catch(() => {});
    }
  };
  const closeAiModal = () => {
    setAiModal(null);
    setAiResult(null);
    setAiError("");
    setPlanSaved(false);
  };

  useEffect(() => {
    if (aiModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [aiModal]);

  async function aiPost(path, body, method = "POST") {
    const res = await apiFetch(`/api/ai${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  const runAi = async (path, body) => {
    setAiLoading(true);
    setAiResult(null);
    setAiError("");
    setPlanSaved(false);
    try {
      const data = await aiPost(path, body);
      setAiResult(data);
      setTimeout(
        () => aiResultRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const savePlan = async () => {
    const content = aiResult?.study_plan || aiResult?.content;
    if (!content) {
      setAiError("No study plan content to save.");
      return;
    }
    setPlanSaving(true);
    try {
      const saved = await aiPost(`/students/${user.id}/study-plans/save`, {
        content,
        courses: planForm.enrolled_courses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        hoursPerWeek: Number(planForm.available_hours_per_week),
        goals: planForm.goals,
      });
      setSavedPlans((prev) => [saved, ...prev]);
      setPlanSaved(true);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setPlanSaving(false);
    }
  };

  const deletePlan = async (id) => {
    try {
      const res = await apiFetch(`/api/ai/study-plans/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }
      setSavedPlans((prev) =>
        prev.filter((p) => (p._id || p.id).toString() !== id.toString()),
      );
      if (expandedPlanId === id) setExpandedPlanId(null);
    } catch (err) {
      setAiError(err.message);
    }
  };

  const loadRealPerformanceData = async (courseData) => {
    const subject = courseData.title;
    setPerfForm((f) => ({
      ...f,
      subject,
      quiz_scores: courseData.quizScores.join(", "),
      assignment_grades: courseData.assignmentGrades.join(", "),
    }));
  };

  const analyzeRealPerformance = async () => {
    if (!perfForm.subject) {
      setAiError("Select a subject first.");
      return;
    }
    setPerfLoadingReal(true);
    setAiResult(null);
    setAiError("");
    try {
      const data = await aiPost("/analyze-performance-real", {
        studentId: user.id,
        subject: perfForm.subject,
      });
      setAiResult(data);
      setTimeout(
        () => aiResultRef.current?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } catch (err) {
      setAiError(err.message);
    } finally {
      setPerfLoadingReal(false);
    }
  };

  // ── Quiz functions ──────────────────────────────────────────────────────────
  const loadActiveQuizzes = async (enrolledCourses) => {
    if (!enrolledCourses?.length) return;
    setQuizzesLoading(true);
    try {
      const results = await Promise.all(
        enrolledCourses.map((c) =>
          apiFetch(`/api/courses/${c.id}/quizzes`, { credentials: "include" })
            .then((r) => r.json())
            .then((qs) =>
              Array.isArray(qs)
                ? qs
                    .filter((q) => q.isActive)
                    .map((q) => ({ ...q, courseTitle: c.title }))
                : [],
            )
            .catch(() => []),
        ),
      );
      setActiveQuizzes(results.flat());
    } finally {
      setQuizzesLoading(false);
    }
  };

  const startQuiz = async (quiz) => {
    setQuizModal(quiz);
    setQuizAnswers({});
    setQuizResult(null);
    // check if already taken
    try {
      const res = await apiFetch(
        `/api/quizzes/${quiz.id}/my-result?studentId=${user.id}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const d = await res.json();
        setQuizResult(d);
      }
    } catch {
      /* not taken yet */
    }
  };

  const submitQuizAnswers = async () => {
    if (!quizModal) return;
    setQuizSubmitting(true);
    try {
      const answers = quizModal.questions.map((_, i) => ({
        questionIndex: i,
        selectedOption: quizAnswers[i] ?? -1,
      }));
      const res = await apiFetch(`/api/quizzes/${quizModal.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ studentId: user.id, answers }),
      });
      const d = await res.json();
      if (res.ok) setQuizResult(d);
    } catch {
      /* silent */
    } finally {
      setQuizSubmitting(false);
    }
  };

  // ── Assignment functions ────────────────────────────────────────────────────
  const loadAssignments = async (enrolledCourses) => {
    if (!enrolledCourses?.length) return;
    setAssignmentsLoading(true);
    try {
      const results = await Promise.all(
        enrolledCourses.map((c) =>
          apiFetch(`/api/courses/${c.id}/assignments`, {
            credentials: "include",
          })
            .then((r) => r.json())
            .then((as) =>
              Array.isArray(as)
                ? as.map((a) => ({ ...a, courseTitle: c.title }))
                : [],
            )
            .catch(() => []),
        ),
      );
      setMyAssignments(results.flat());
    } finally {
      setAssignmentsLoading(false);
    }
  };

  const openSubmitModal = async (assignment) => {
    setSubmitModal(assignment);
    setSubmitContent("");
    setMySubmission(null);
    setAiFeedback(null);
    try {
      const res = await apiFetch(
        `/api/assignments/${assignment.id}/my-submission?studentId=${user.id}`,
        { credentials: "include" },
      );
      if (res.ok) {
        const d = await res.json();
        setMySubmission(d);
        setSubmitContent(d.content || "");
      }
    } catch {
      /* not submitted yet */
    }
  };

  const submitAssignmentWork = async () => {
    if (!submitModal || !submitContent.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/assignments/${submitModal.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ studentId: user.id, content: submitContent }),
      });
      const d = await res.json();
      if (res.ok) setMySubmission(d);
    } catch {
      /* silent */
    } finally {
      setSubmitting(false);
    }
  };

  const getAIFeedback = async () => {
    if (!mySubmission?.id) return;
    setAiFeedbackLoading(true);
    setAiFeedback(null);
    try {
      const res = await apiFetch(
        `/api/ai/submissions/${mySubmission.id}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({}),
        },
      );
      const d = await res.json();
      if (res.ok) setAiFeedback(d.feedback || d.response || JSON.stringify(d));
    } catch {
      /* silent */
    } finally {
      setAiFeedbackLoading(false);
    }
  };

  const sendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = { role: "user", content: chatInput.trim() };
    const newHistory = [...chatHistory, msg];
    setChatHistory(newHistory);
    setChatInput("");
    setAiLoading(true);
    setAiError("");
    try {
      const data = await aiPost("/chat", {
        message: msg.content,
        history: chatHistory,
        user_role: "student",
        course_context:
          enrolled.length > 0
            ? enrolled.map((c) => c.title).join(", ")
            : undefined,
      });
      setChatHistory([
        ...newHistory,
        { role: "assistant", content: data.response },
      ]);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
      setTimeout(
        () => chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }),
        50,
      );
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      const dashResponse = await apiFetch(`/api/students/${user.id}/dashboard`);
      const dashDataRes = await dashResponse.json();
      if (!dashDataRes.error) {
        setDashData(dashDataRes);
        // Load quizzes & assignments for enrolled courses
        const enrolled = dashDataRes.enrolledCourses || [];
        loadActiveQuizzes(enrolled);
        loadAssignments(enrolled);
      }

      const coursesResponse = await apiFetch("/api/courses");
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
      const response = await apiFetch("/api/enrollments", {
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
      const response = await apiFetch("/api/enrollments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          courseId: confirmUnenroll.id,
        }),
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
  {
    icon: BookOpen,
    val: dashData.totalEnrolled ?? enrolled.length,
    label: "Enrolled",
  },
  {
    icon: ClipboardList,
    val: dashData.pendingAssignments ?? 0,
    label: "Pending",
  },
  {
    icon: Brain,
    val: dashData.completedQuizzes ?? 0,
    label: "Quizzes Done",
  },
  {
    icon: Video,
    val: dashData.upcomingClasses?.length ?? 0,
    label: "Upcoming",
  },
];

  const chartColors = ["#7cff6b", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"];

  const tooltipStyle = {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    boxShadow: "0 12px 32px -8px rgba(0,0,0,0.2)",
    fontSize: "12px",
    fontWeight: 600,
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#7c3aed33,transparent_40%)]" />
  <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#22c55e33,transparent_40%)]" />
</div>
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-[slide-down_0.6s_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="flex items-center gap-5 mb-2">
            <GraduationCap className="w-12 h-12 text-[var(--accent)] animate-float" />
            <div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[var(--text)] sc-title">
                Welcome back,{" "}
                <span className="gradient-text">
                  {user?.name?.split(" ")[0] || "Student"}
                </span>
                !
              </h1>
              <p className="text-sm text-[var(--muted)] mt-2 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Your personalized learning dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
       <div className="relative flex flex-col gap-8 mb-12">

  {/* Top Divider */}
  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-40" />

  {/* Stats Cards */}
  <div className="flex flex-wrap justify-center gap-8">

    {stats.map((s, i) => {
      const Icon = s.icon;

      return (
        <div
          key={s.label}
          className="
            group relative w-[240px] h-[160px]
            rounded-2xl
            bg-white
            border border-green-100
            shadow-md
            hover:shadow-xl
            transition-all duration-300
            hover:-translate-y-1
          "
        >
          {/* Soft Hover Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300">
            <div className="absolute inset-0 bg-green-100/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 text-center px-4">

            {/* Icon */}
            <div className="p-3 rounded-xl bg-green-50 group-hover:bg-green-100 transition">
              <Icon className="w-7 h-7 text-green-600" />
            </div>

            {/* Value */}
            <p className="text-3xl font-bold text-gray-800">
              {s.val}
            </p>

            {/* Label */}
            <p className="text-sm text-gray-500 font-medium">
              {s.label}
            </p>
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 group-hover:w-full transition-all duration-300 rounded-b-2xl" />
        </div>
      );
    })}

  </div>
</div>

        {/* AI Assistant Section */}
        <div
          className="mb-12 animate-[slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
          style={{ animationDelay: "120ms" }}
        >
          <h2 className="text-2xl font-extrabold text-[var(--text)] mb-5 flex items-center gap-3 sc-title">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
  <BrainCircuit className="w-5 h-5 text-[var(--accent)]" />
</div>
            AI Assistant
          </h2>
         <div className="relative flex flex-col gap-8">

  {/* Top Divider */}
  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-40" />

  {/* AI Tools */}
  <div className="flex flex-wrap justify-center gap-8">

    {[
      {
        icon: MessageCircle,
        label: "AI Chat",
        desc: "Ask anything instantly",
        type: "chat",
      },
      {
        icon: CalendarDays,
        label: "Study Plan",
        desc: "Smart weekly planner",
        type: "plan",
      },
      {
        icon: Lightbulb,
        label: "Explain",
        desc: "Break down concepts",
        type: "explain",
      },
      {
        icon: BarChart3,
        label: "Performance",
        desc: "Analyze progress",
        type: "performance",
      },
    ].map((tool) => {
      const Icon = tool.icon;

      return (
        <button
          key={tool.type}
          onClick={() => openAiModal(tool.type)}
          className="
            group relative w-[240px] h-[160px]
            rounded-2xl
            bg-white
            border border-green-100
            shadow-md
            hover:shadow-xl
            transition-all duration-300
            hover:-translate-y-1
          "
        >
          {/* Soft Hover Glow */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300">
            <div className="absolute inset-0 bg-green-100/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full gap-4 text-center px-4">

            {/* Icon */}
            <div className="p-4 rounded-xl bg-green-50 group-hover:bg-green-100 transition">
              <Icon className="w-7 h-7 text-green-600" />
            </div>

            {/* Title */}
            <p className="text-base font-semibold text-gray-800">
              {tool.label}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-500">
              {tool.desc}
            </p>
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-green-500 group-hover:w-full transition-all duration-300 rounded-b-2xl" />
        </button>
      );
    })}
  </div>
</div>
        </div>

        {/* ── Active Quizzes ── */}
       <div className="mb-14">

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold flex items-center gap-3 text-[var(--text)]">
      <div className="p-2 rounded-xl bg-[var(--accent)]/15 ">
        <Brain className="w-6 h-6 text-[var(--accent)]" />
      </div>
      Active Quizzes
    </h2>
  </div>

  {quizzesLoading ? (
    <div className="flex items-center gap-3 text-[var(--muted)] text-sm py-6">
      <span className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
      Loading quizzes…
    </div>
  ) : activeQuizzes.length === 0 ? (
    <div className="bg-white border border-green-100 rounded-2xl p-10 text-center shadow-sm">
      <Brain className="w-10 h-10 text-green-400 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">
        No active quizzes right now
      </p>
    </div>
  ) : (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {activeQuizzes.map((q) => (
        <div
          key={q.id}
          className="group bg-white border border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
        >

          {/* Top */}
          <div>
            <p className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
              {q.title}
            </p>

            <p className="text-xs text-gray-500 mb-4">
              {q.courseTitle}
            </p>

            {/* Meta */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">

              <span className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                {q.questionCount ?? q.questions?.length ?? 0} Q
              </span>

              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {q.timeLimit ? `${q.timeLimit} min` : "No limit"}
              </span>

              {q.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(q.dueDate).toLocaleDateString()}
                </span>
              )}

            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => startQuiz(q)}
            className="mt-6 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 transition active:scale-95"
          >
            Start Quiz →
          </button>

        </div>
      ))}

    </div>
  )}
</div>

        {/* ── My Assignments ── */}
       <div className="mb-14">

  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold flex items-center gap-3 text-[var(--text)]">
      <div className="p-2 rounded-xl bg-[var(--accent)]/15 ">
        <ClipboardList className="w-6 h-6 text-[var(--accent)]" />
      </div>
      My Assignments
    </h2>
  </div>

  {assignmentsLoading ? (
    <div className="flex items-center gap-3 text-[var(--muted)] text-sm py-6">
      <span className="w-5 h-5 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin" />
      Loading assignments…
    </div>
  ) : myAssignments.length === 0 ? (
    <div className="bg-white border border-green-100 rounded-2xl p-10 text-center shadow-sm">
      <ClipboardList className="w-10 h-10 text-green-400 mx-auto mb-3" />
      <p className="text-gray-500 font-medium">
        No assignments yet
      </p>
    </div>
  ) : (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

      {myAssignments.map((a) => {
        const isOverdue = a.dueDate && new Date(a.dueDate) < new Date();

        return (
          <div
            key={a.id}
            className="group bg-white border border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
          >

            {/* Top */}
            <div>
              <p className="font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
                {a.title}
              </p>

              <p className="text-xs text-gray-500 mb-3">
                {a.courseTitle}
              </p>

              {a.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {a.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex justify-between text-xs">

                <span className="text-gray-500">
                  {a.maxScore} pts
                </span>

                {a.dueDate ? (
                  <span className={isOverdue ? "text-red-500 font-semibold" : "text-gray-500"}>
                    {isOverdue ? "Overdue" : "Due"}:{" "}
                    {new Date(a.dueDate).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-gray-400">No due date</span>
                )}

              </div>
            </div>

            {/* Button */}
            <button
              onClick={() => openSubmitModal(a)}
              className="mt-6 py-3 rounded-xl border border-green-500 text-green-600 font-semibold text-sm hover:bg-green-50 transition active:scale-95"
            >
              Submit / View →
            </button>

          </div>
        );
      })}

    </div>
  )}
</div>

        {/* Charts Section */}
        {dashData.performanceData?.length > 0 ||
        dashData.progressData?.length > 0 ||
        dashData.timeSpentData?.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {dashData.performanceData?.length > 0 && (
              <div
                className="sc-card-premium glass rounded-2xl p-6 animate-[slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: "100ms" }}
              >
                <h3 className="text-lg font-bold text-[var(--text)] mb-5 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-green-500/15 flex items-center justify-center text-sm">
                    📊
                  </span>
                  Performance Trend
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={dashData.performanceData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      opacity={0.5}
                    />
                    <XAxis
                      stroke="var(--muted)"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="var(--muted)"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      cursor={{
                        stroke: "var(--accent)",
                        strokeWidth: 2,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#818cf8"
                      strokeWidth={3}
                      dot={{
                        fill: "#818cf8",
                        r: 5,
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {dashData.progressData?.length > 0 && (
              <div
                className="sc-card-premium glass rounded-2xl p-6 animate-[slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: "200ms" }}
              >
                <h3 className="text-lg font-bold text-[var(--text)] mb-5 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-sm">
                    🎯
                  </span>
                  Course Progress
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dashData.progressData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      opacity={0.5}
                    />
                    <XAxis
                      stroke="var(--muted)"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    />
                    <YAxis
                      stroke="var(--muted)"
                      style={{ fontSize: "11px", fontWeight: 600 }}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar
                      dataKey="completion"
                      fill="#a78bfa"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {dashData.timeSpentData?.length > 0 && (
              <div
                className="sc-card-premium glass rounded-2xl p-6 animate-[slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: "300ms" }}
              >
                <h3 className="text-lg font-bold text-[var(--text)] mb-5 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center text-sm">
                    ⏱️
                  </span>
                  Time Spent by Course
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={dashData.timeSpentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={100}
                      innerRadius={50}
                      fill="#8884d8"
                      dataKey="hours"
                      strokeWidth={2}
                      stroke="var(--bg)"
                    >
                      {dashData.timeSpentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        ) : null}

        {/* Upcoming Live Classes */}
        {dashData.upcomingClasses?.length > 0 && (
          <div
            className="mb-12 animate-[slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: "200ms" }}
          >
            <h2 className="text-2xl font-extrabold text-[var(--text)] mb-5 flex items-center gap-3 sc-title">
              <span className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center text-xl">
                📹
              </span>
              Upcoming Live Classes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashData.upcomingClasses.slice(0, 3).map((lc, i) => (
                <div
                  key={lc.id}
                  className="sc-card-premium glass rounded-2xl p-5 hover-lift
                           animate-[slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                        lc.status === "live"
                          ? "bg-red-500/15 text-red-500 animate-pulse border border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.2)]"
                          : "bg-green-500/15 text-green-500 border border-green-500/30"
                      }`}
                    >
                      {lc.status === "live" ? "🔴 LIVE" : "🗓️ Scheduled"}
                    </span>
                    <span className="text-[10px] text-[var(--muted)] font-semibold">
                      {new Date(lc.scheduledAt).toLocaleDateString()} ·{" "}
                      {new Date(lc.scheduledAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[var(--text)] mb-2 line-clamp-2">
                    {lc.title}
                  </p>
                  {lc.course?.title && (
                    <p className="text-xs text-[var(--muted)] mb-3 font-medium">
                      📚 {lc.course.title}
                    </p>
                  )}
                  {lc.meetingLink && (
                    <a
                      href={lc.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:text-[var(--accent-light)] 
                                 transition-all duration-300 hover:translate-x-0.5"
                    >
                      Join Meeting <span>→</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Courses */}
        {enrolled.length > 0 && (
          <div
            className="mb-12 animate-[slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--text)] flex items-center gap-3 sc-title">
                  <span className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center text-xl">
                    📖
                  </span>
                  My Learning Path
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1 font-medium ml-[52px]">
                  Continue where you left off
                </p>
              </div>
              <span
                className="px-4 py-2 rounded-full glass text-[var(--accent)] text-xs font-bold
                               border border-[var(--accent)]/25 shadow-[0_4px_16px_-4px_var(--accent)]"
              >
                {enrolled.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolled.map((c, i) => (
                <div
                  key={c.id}
                  className="group sc-card-premium glass rounded-2xl p-6 overflow-hidden
                           animate-[slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both]"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Hover gradient overlay */}
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/0 to-[var(--accent)]/0
                                 group-hover:from-[var(--accent)]/5 group-hover:to-[var(--accent)]/0 transition-all duration-500"
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <h3 className="text-lg font-bold text-[var(--text)] flex-1 leading-snug group-hover:text-[var(--accent)] transition-colors duration-300">
                        {c.title}
                      </h3>
                      {c.subject && (
                        <span
                          className="px-3 py-1 bg-[var(--accent)]/12 text-[var(--accent)] rounded-lg text-[10px] font-bold whitespace-nowrap
                                         uppercase tracking-wider border border-[var(--accent)]/15"
                        >
                          {c.subject}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[var(--muted)] mb-4 flex items-center gap-1.5 font-medium">
                      👨‍🏫 {c.teacher?.name || "Unknown"}
                    </p>

                    {/* Stats mini-grid */}
                    <div className="grid grid-cols-3 gap-2 mb-5">
                      {[
                        {
                          val: c.materialCount || 0,
                          label: "Materials",
                          color: "green",
                        },
                        {
                          val: c.assignmentCount || 0,
                          label: "Tasks",
                          color: "amber",
                        },
                        {
                          val: c.quizCount || 0,
                          label: "Quizzes",
                          color: "purple",
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className={`p-2.5 rounded-xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 
                                  border border-${stat.color}-500/15 text-center transition-all duration-300
                                  group-hover:border-${stat.color}-500/30`}
                        >
                          <p className="font-extrabold text-[var(--text)] text-lg">
                            {stat.val}
                          </p>
                          <p className="text-[9px] text-[var(--muted)] font-bold uppercase tracking-wider mt-0.5">
                            {stat.label}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/course/${c.id}`)}
                        className="flex-1 py-3 rounded-xl text-sm font-bold cursor-pointer sc-btn-glow active:scale-95"
                      >
                        Open Course →
                      </button>
                      <button
                        onClick={() => setConfirmUnenroll(c)}
                        className="px-3 py-3 rounded-xl text-sm font-bold border border-red-500/25 bg-red-500/8 
                                   hover:bg-red-500/15 text-red-500 cursor-pointer transition-all duration-300
                                   hover:border-red-500/40 active:scale-95"
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
  <div
    className="animate-[slide-up_0.6s_cubic-bezier(0.16,1,0.3,1)_both]"
    style={{ animationDelay: "400ms" }}
  >
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-extrabold text-[var(--text)] flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">
            🌟
          </span>
          Explore More
        </h2>
        <p className="text-sm text-[var(--text)] mt-1 ml-[52px]">
          Expand your skills with new courses
        </p>
      </div>

      <span className="px-4 py-2 rounded-full text-emerald-600 text-xs font-bold bg-emerald-50 border border-emerald-200">
        {available.length} available
      </span>
    </div>

    {/* Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {available.map((c, i) => (
        <div
          key={c.id}
          className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          style={{ animationDelay: `${(enrolled.length + i) * 80}ms` }}
        >
          {/* Title + Subject */}
          <div className="flex items-start justify-between mb-3 gap-3">
            <h3 className="text-lg font-bold text-gray-800 flex-1 leading-snug group-hover:text-emerald-600 transition">
              {c.title}
            </h3>

            {c.subject && (
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                {c.subject}
              </span>
            )}
          </div>

          {/* Teacher */}
          <p className="text-xs text-gray-500 mb-2 font-medium">
            👨‍🏫 {c.teacher?.name || "Unknown"}
          </p>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
            {c.description ||
              "Explore this amazing course and expand your knowledge"}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="font-bold text-gray-800 text-lg">
                {c.enrollmentCount || 0}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                Enrolled
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-center">
              <p className="font-bold text-gray-800 text-lg">
                {c.materialCount || 0}
              </p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">
                Materials
              </p>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => enroll(c.id)}
            disabled={enrollingId === c.id}
            className="w-full py-3 rounded-xl text-sm font-bold cursor-pointer transition-all duration-300
              bg-emerald-500 text-white hover:bg-emerald-600
              disabled:opacity-60 disabled:cursor-not-allowed
              hover:shadow-md active:scale-95"
          >
            {enrollingId === c.id ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Enrolling...
              </span>
            ) : (
              "+ Enroll Now"
            )}
          </button>
        </div>
      ))}
    </div>
  </div>
)}

        {/* Empty state */}
        {enrolled.length === 0 && available.length === 0 && !loading && (
          <div className="text-center py-24 animate-[scale-in_0.5s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="text-8xl mb-6 drop-shadow-lg animate-float">🎓</div>
            <h3 className="text-2xl font-extrabold text-[var(--text)] mb-3 sc-title">
              No Courses Yet
            </h3>
            <p className="text-[var(--muted)] text-base max-w-md mx-auto font-medium leading-relaxed">
              Your learning journey starts here! Ask your teacher to create
              courses for you.
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className="w-14 h-14 border-[3px] border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin
                           shadow-[0_0_16px_var(--accent)]"
            />
            <p className="text-sm text-[var(--muted)] font-medium animate-pulse">
              Loading your dashboard...
            </p>
          </div>
        )}
      </div>

      <Footer />

      {/* Floating AI Chat Button */}
      <button
        onClick={() => openAiModal("chat")}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[var(--accent)] text-white text-2xl
                   shadow-[0_8px_32px_-8px_var(--accent)] hover:scale-110 active:scale-95 transition-all duration-300
                   flex items-center justify-center"
        title="Open AI Chat"
      >
        💬
      </button>

      {/* ── Quiz Taking Modal ── */}
      {quizModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !quizResult) return;
            if (e.target === e.currentTarget && quizResult) setQuizModal(null);
          }}
        >
          <div className="glass-heavy border border-[var(--border)]/50 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] animate-[scale-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]/30 shrink-0">
              <h3 className="text-lg font-extrabold text-[var(--text)] flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-pink-500/15 flex items-center justify-center text-lg">
                  🧠
                </span>
                {quizModal.title}
              </h3>
              <button
                onClick={() => setQuizModal(null)}
                className="w-8 h-8 rounded-lg glass border border-[var(--border)]/40 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5">
              {quizResult ? (
                /* Result screen */
                <div className="text-center py-8 space-y-5">
                  <div
                    className={`text-6xl ${quizResult.percentage >= 70 ? "animate-bounce" : ""}`}
                  >
                    {quizResult.percentage >= 80
                      ? "🎉"
                      : quizResult.percentage >= 50
                        ? "👍"
                        : "📖"}
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-[var(--text)]">
                      {quizResult.percentage}%
                    </p>
                    <p className="text-sm text-[var(--muted)] mt-1">
                      {quizResult.score} / {quizResult.totalPoints} points
                    </p>
                  </div>
                  <div className="w-full h-3 bg-[var(--border)]/20 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${quizResult.percentage >= 70 ? "bg-green-500" : quizResult.percentage >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${quizResult.percentage}%` }}
                    />
                  </div>
                  {/* Question review */}
                  <div className="text-left space-y-3 mt-4">
                    {quizModal.questions.map((q, i) => {
                      const userAns = quizResult.answers?.find(
                        (a) => a.questionIndex === i,
                      );
                      const correct = q.correctOption;
                      const chosen = userAns?.selectedOption;
                      return (
                        <div
                          key={i}
                          className={`p-3 rounded-xl border text-sm ${chosen === correct ? "border-green-500/30 bg-green-500/5" : "border-red-400/30 bg-red-500/5"}`}
                        >
                          <p className="font-semibold text-[var(--text)] mb-2">
                            <span className="text-[var(--accent)] mr-1">
                              Q{i + 1}.
                            </span>
                            {q.question}
                          </p>
                          {q.options.map((opt, j) => (
                            <p
                              key={j}
                              className={`text-xs px-2.5 py-1 rounded-lg mb-1 ${j === correct ? "bg-green-500/15 text-green-400 font-semibold" : j === chosen && j !== correct ? "bg-red-500/15 text-red-400 line-through" : "text-[var(--muted)]"}`}
                            >
                              {String.fromCharCode(65 + j)}. {opt}
                            </p>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setQuizModal(null)}
                    className="px-6 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* Question taking screen */
                <div className="space-y-5">
                  <p className="text-xs text-[var(--muted)] font-semibold">
                    {quizModal.questions?.length ?? 0} questions ·{" "}
                    {Object.keys(quizAnswers).length} answered
                  </p>
                  {quizModal.questions?.map((q, qi) => (
                    <div
                      key={qi}
                      className="border border-[var(--border)]/40 rounded-xl p-4 space-y-3 glass"
                    >
                      <p className="font-semibold text-sm text-[var(--text)]">
                        <span className="text-[var(--accent)] mr-1.5">
                          Q{qi + 1}.
                        </span>
                        {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, oi) => (
                          <button
                            key={oi}
                            onClick={() =>
                              setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))
                            }
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer border ${quizAnswers[qi] === oi ? "bg-[var(--accent)]/15 border-[var(--accent)]/50 text-[var(--accent)] font-semibold" : "border-[var(--border)]/30 text-[var(--text)] hover:border-[var(--accent)]/30 hover:bg-[var(--accent)]/5"}`}
                          >
                            <span className="font-bold mr-2">
                              {String.fromCharCode(65 + oi)}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={submitQuizAnswers}
                    disabled={
                      quizSubmitting ||
                      Object.keys(quizAnswers).length <
                        (quizModal.questions?.length ?? 0)
                    }
                    className="w-full py-3 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {quizSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      `Submit Quiz (${Object.keys(quizAnswers).length}/${quizModal.questions?.length ?? 0} answered)`
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Assignment Submission Modal ── */}
      {submitModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setSubmitModal(null)}
        >
          <div className="glass-heavy border border-[var(--border)]/50 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] animate-[scale-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]/30 shrink-0">
              <h3 className="text-lg font-extrabold text-[var(--text)] flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center text-lg">
                  📝
                </span>
                {submitModal.title}
              </h3>
              <button
                onClick={() => setSubmitModal(null)}
                className="w-8 h-8 rounded-lg glass border border-[var(--border)]/40 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* Assignment details */}
              {submitModal.description && (
                <div className="p-4 rounded-xl border border-[var(--border)]/30 glass">
                  <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">
                    Assignment Details
                  </p>
                  <SdAiMarkdown text={submitModal.description} />
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-[var(--muted)] font-semibold">
                <span>
                  Max Score:{" "}
                  <strong className="text-[var(--text)]">
                    {submitModal.maxScore}
                  </strong>
                </span>
                {submitModal.dueDate && (
                  <span>
                    Due:{" "}
                    <strong className="text-[var(--text)]">
                      {new Date(submitModal.dueDate).toLocaleString()}
                    </strong>
                  </span>
                )}
                <span>
                  Course:{" "}
                  <strong className="text-[var(--text)]">
                    {submitModal.courseTitle}
                  </strong>
                </span>
              </div>

              {/* Submission status */}
              {mySubmission && (
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${mySubmission.status === "graded" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"}`}
                >
                  {mySubmission.status === "graded"
                    ? `✓ Graded: ${mySubmission.score}/${submitModal.maxScore} pts`
                    : "⏳ Submitted — awaiting review"}
                  {mySubmission.feedback && (
                    <span className="text-[var(--muted)] ml-2">
                      · Has feedback
                    </span>
                  )}
                </div>
              )}

              {/* Text submission */}
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-2">
                  Your Submission
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)] placeholder:text-[var(--muted)]/50 resize-none"
                  rows={6}
                  placeholder="Write your answer, solution, or paste your work here…"
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                />
              </div>
              <button
                onClick={submitAssignmentWork}
                disabled={submitting || !submitContent.trim()}
                className="w-full py-3 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : mySubmission ? (
                  "Update Submission →"
                ) : (
                  "Submit →"
                )}
              </button>

              {/* AI Feedback section */}
              {mySubmission && (
                <div className="border-t border-[var(--border)]/30 pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-[var(--text)] flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
  <BrainCircuit className="w-5 h-5 text-[var(--accent)]" />
</div> AI Feedback
                    </p>
                    <button
                      onClick={getAIFeedback}
                      disabled={aiFeedbackLoading}
                      className="px-4 py-2 rounded-xl border border-green-500/30 text-green-400 text-xs font-bold hover:bg-green-500/10 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {aiFeedbackLoading ? (
                        <>
                          <span className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin" />
                          Analyzing…
                        </>
                      ) : (
                        "Get AI Feedback"
                      )}
                    </button>
                  </div>
                  {mySubmission.feedback && !aiFeedback && (
                    <div className="border border-[var(--border)]/40 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 border-b border-[var(--border)]/30 bg-green-500/5 text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">
                        Saved Feedback
                      </div>
                      <div className="p-4">
                        <SdAiMarkdown text={mySubmission.feedback} />
                      </div>
                    </div>
                  )}
                  {aiFeedback && (
                    <div className="border border-green-500/30 rounded-xl overflow-hidden">
                      <div className="px-4 py-2 border-b border-green-500/20 bg-green-500/5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">
                          AI Analysis
                        </span>
                      </div>
                      <div className="p-4">
                        <SdAiMarkdown text={aiFeedback} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── AI Modal ── */}
      {aiModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && closeAiModal()}
        >
          <div className="glass-heavy border border-[var(--border)]/50 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_32px_80px_-16px_rgba(0,0,0,0.5)] animate-[scale-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]/30 shrink-0">
              <h3 className="text-lg font-extrabold text-[var(--text)] flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-green-500/15 flex items-center justify-center text-lg">
                  {aiModal === "chat"
                    ? "💬"
                    : aiModal === "plan"
                      ? "📅"
                      : aiModal === "explain"
                        ? "💡"
                        : "📊"}
                </span>
                {aiModal === "chat" && "AI Chat Assistant"}
                {aiModal === "plan" && "Generate Study Plan"}
                {aiModal === "explain" && "Explain a Concept"}
                {aiModal === "performance" && "Analyze My Performance"}
              </h3>
              <button
                onClick={closeAiModal}
                className="w-8 h-8 rounded-lg glass border border-[var(--border)]/40 flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-4">
              {/* ── CHAT ── */}
             {aiModal === "chat" && (
  <div className="flex flex-col h-full">

    {/* Chat Box */}
    <div className="flex-1 bg-white rounded-2xl border border-green-100 shadow-sm p-4 overflow-y-auto space-y-4">

      {/* Empty State */}
      {chatHistory.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 text-sm">
          <div className="text-3xl mb-2">💬</div>
          Ask me anything about your courses…
        </div>
      )}

      {/* Messages */}
      {chatHistory.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`
              max-w-[75%] px-4 py-3 text-sm leading-relaxed rounded-2xl shadow-sm
              ${m.role === "user"
                ? "bg-green-500 text-white rounded-br-md"
                : "bg-gray-50 border border-gray-200 text-gray-800 rounded-bl-md"}
            `}
          >
            {m.role === "assistant" ? (
              <SdAiMarkdown text={m.content} />
            ) : (
              m.content
            )}
          </div>
        </div>
      ))}

      {/* Typing Loader */}
      {aiLoading && (
        <div className="flex justify-start">
          <div className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {aiError && (
        <p className="text-red-400 text-xs text-center">
          {aiError}
        </p>
      )}

      <div ref={chatBottomRef} />
    </div>

    {/* Input Area */}
    <form
      onSubmit={sendChat}
      className="mt-3 flex items-center gap-2 bg-white border border-green-100 rounded-xl p-2 shadow-sm"
    >
      <input
        className="flex-1 px-3 py-2 text-sm outline-none text-gray-700 placeholder-gray-400"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Ask anything educational…"
      />

      <button
        type="submit"
        disabled={aiLoading || !chatInput.trim()}
        className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold text-sm disabled:opacity-50 transition hover:bg-green-600 active:scale-95"
      >
        Send
      </button>
    </form>

    {/* Clear Button */}
    <button
      onClick={() => {
        setChatHistory([]);
        setAiError("");
      }}
      className="text-xs text-gray-400 hover:text-red-500 transition mt-2 text-right"
    >
      Clear conversation
    </button>
  </div>
)}

              {/* ── STUDY PLAN ── */}
              {aiModal === "plan" && (
                <>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      runAi("/study-plan", {
                        student_name: planForm.student_name,
                        enrolled_courses: planForm.enrolled_courses
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                        weak_areas: planForm.weak_areas
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                        available_hours_per_week: Number(
                          planForm.available_hours_per_week,
                        ),
                        goals: planForm.goals || undefined,
                      });
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Your Name *
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)] placeholder:text-[var(--muted)]/50"
                          required
                          value={planForm.student_name}
                          onChange={(e) =>
                            setPlanForm((f) => ({
                              ...f,
                              student_name: e.target.value,
                            }))
                          }
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Hours / Week
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={80}
                          className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)]"
                          value={planForm.available_hours_per_week}
                          onChange={(e) =>
                            setPlanForm((f) => ({
                              ...f,
                              available_hours_per_week: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Enrolled Courses *
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)] placeholder:text-[var(--muted)]/50"
                          required
                          value={planForm.enrolled_courses}
                          onChange={(e) =>
                            setPlanForm((f) => ({
                              ...f,
                              enrolled_courses: e.target.value,
                            }))
                          }
                          placeholder="Comma-separated course names"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Weak Areas (optional)
                        </label>
                        <input
                          className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)] placeholder:text-[var(--muted)]/50"
                          value={planForm.weak_areas}
                          onChange={(e) =>
                            setPlanForm((f) => ({
                              ...f,
                              weak_areas: e.target.value,
                            }))
                          }
                          placeholder="e.g. Recursion, CSS Flexbox"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                          Goals (optional)
                        </label>
                        <textarea
                          className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)] placeholder:text-[var(--muted)]/50 resize-none"
                          rows={2}
                          value={planForm.goals}
                          onChange={(e) =>
                            setPlanForm((f) => ({
                              ...f,
                              goals: e.target.value,
                            }))
                          }
                          placeholder="e.g. Prepare for exams"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={aiLoading}
                      className="w-full py-3 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {aiLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Generating…
                        </>
                      ) : (
                        "Generate Study Plan →"
                      )}
                    </button>
                    {aiError && (
                      <p className="text-red-400 text-sm">{aiError}</p>
                    )}
                    {aiResult && (
                      <div ref={aiResultRef} className="space-y-3">
                        <div className="border border-[var(--border)]/40 rounded-xl overflow-hidden">
                          <div className="px-4 py-2 border-b border-[var(--border)]/30 bg-green-500/5 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">
                              Study Plan
                            </span>
                          </div>
                          <div className="p-4 max-h-[40vh] overflow-y-auto">
                            <SdAiMarkdown
                              text={
                                aiResult.study_plan || JSON.stringify(aiResult)
                              }
                            />
                          </div>
                        </div>
                        {planSaved ? (
                          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
                            <span>✓</span> Plan saved to your account!
                          </div>
                        ) : (
                          <button
                            onClick={savePlan}
                            disabled={planSaving}
                            className="w-full py-2.5 rounded-xl border border-[var(--accent)]/40 text-[var(--accent)] text-sm font-bold hover:bg-[var(--accent)]/10 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {planSaving ? (
                              <>
                                <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                                Saving…
                              </>
                            ) : (
                              "💾 Save Study Plan"
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </form>
                  {/* Saved study plans list */}
                  {savedPlans.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-[var(--border)]/30">
                      <p className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3">
                        Saved Study Plans ({savedPlans.length})
                      </p>
                      <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                        {savedPlans.map((plan) => {
                          const pid = plan._id || plan.id;
                          const isExpanded = expandedPlanId === pid?.toString();
                          return (
                            <div
                              key={pid?.toString()}
                              className="rounded-xl border border-[var(--border)]/30 hover:border-[var(--accent)]/30 transition-all glass overflow-hidden group"
                            >
                              <div
                                className="flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer"
                                onClick={() =>
                                  setExpandedPlanId(
                                    isExpanded ? null : pid?.toString(),
                                  )
                                }
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-[var(--text)] truncate">
                                    {plan.title || "Study Plan"}
                                  </p>
                                  <p className="text-xs text-[var(--muted)] mt-0.5">
                                    {plan.createdAt
                                      ? new Date(
                                          plan.createdAt,
                                        ).toLocaleDateString()
                                      : ""}
                                    {plan.hoursPerWeek
                                      ? ` · ${plan.hoursPerWeek}h/week`
                                      : ""}
                                    {plan.goals
                                      ? ` · ${plan.goals.slice(0, 30)}${plan.goals.length > 30 ? "…" : ""}`
                                      : ""}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span
                                    className="text-xs text-[var(--muted)] transition-transform duration-200"
                                    style={{
                                      transform: isExpanded
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                    }}
                                  >
                                    ▼
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deletePlan(pid);
                                    }}
                                    className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100 text-xs ml-1"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                              {isExpanded && plan.content && (
                                <div className="px-4 pb-4 pt-1 border-t border-[var(--border)]/20">
                                  <SdAiMarkdown text={plan.content} />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ── EXPLAIN ── */}
               {aiModal === "explain" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runAi("/explain", {
                      concept: explainForm.concept,
                      difficulty_level: explainForm.difficulty_level,
                      course_context: explainForm.course_context || undefined,
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Concept *
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)] placeholder:text-[var(--muted)]/50"
                        required
                        value={explainForm.concept}
                        onChange={(e) =>
                          setExplainForm((f) => ({
                            ...f,
                            concept: e.target.value,
                          }))
                        }
                        placeholder="e.g. Recursion, Photosynthesis, Derivatives…"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Difficulty
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)]"
                        value={explainForm.difficulty_level}
                        onChange={(e) =>
                          setExplainForm((f) => ({
                            ...f,
                            difficulty_level: e.target.value,
                          }))
                        }
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Course Context (optional)
                      </label>
                      <input
                        className="w-full px-4 py-3 border border-[var(--border)]/50 rounded-xl text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all glass text-[var(--text)] placeholder:text-[var(--muted)]/50"
                        value={explainForm.course_context}
                        onChange={(e) =>
                          setExplainForm((f) => ({
                            ...f,
                            course_context: e.target.value,
                          }))
                        }
                        placeholder="e.g. Data Structures"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="w-full py-3 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {aiLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Thinking…
                      </>
                    ) : (
                      "Explain →"
                    )}
                  </button>
                  {aiError && <p className="text-red-400 text-sm">{aiError}</p>}
                  {aiResult && (
                    <div
                      ref={aiResultRef}
                      className="border border-[var(--border)]/40 rounded-xl overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-[var(--border)]/30 bg-green-500/5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider">
                          Explanation — {aiResult.level}
                        </span>
                      </div>
                      <div className="p-4 max-h-[40vh] overflow-y-auto">
                        <SdAiMarkdown
                          text={
                            aiResult.explanation || JSON.stringify(aiResult)
                          }
                        />
                      </div>
                    </div>
                  )}
                </form>
              )}

              {/* ── PERFORMANCE ── */}
              {aiModal === "performance" && (
  <div className="space-y-6">

    {/* REAL DATA */}
    {perfContext?.courses?.length > 0 && (
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-bold text-gray-500 mb-3">
          Load Real Data
        </p>
        <div className="flex flex-wrap gap-2">
          {perfContext.courses.map((c) => (
            <button
              key={c.courseId}
              onClick={() => loadRealPerformanceData(c)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* FORM */}
    <form
      onSubmit={(e) => {
        e.preventDefault();
        runAi("/analyze-performance", {
          subject: perfForm.subject,
          quiz_scores: perfForm.quiz_scores
            .split(",")
            .map((s) => parseFloat(s.trim()))
            .filter((n) => !isNaN(n)),
          assignment_grades: perfForm.assignment_grades
            .split(",")
            .map((s) => parseFloat(s.trim()))
            .filter((n) => !isNaN(n)),
          course_progress: Number(perfForm.course_progress),
        });
      }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5"
    >
      <h3 className="text-lg font-bold text-gray-800">
        Analyze Performance
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <input
          required
          value={perfForm.subject}
          onChange={(e) =>
            setPerfForm((f) => ({
              ...f,
              subject: e.target.value,
            }))
          }
          placeholder="Subject"
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
        />

        <input
          type="number"
          min={0}
          max={100}
          value={perfForm.course_progress}
          onChange={(e) =>
            setPerfForm((f) => ({
              ...f,
              course_progress: e.target.value,
            }))
          }
          placeholder="Progress %"
          className="px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
        />

        <input
          value={perfForm.quiz_scores}
          onChange={(e) =>
            setPerfForm((f) => ({
              ...f,
              quiz_scores: e.target.value,
            }))
          }
          placeholder="Quiz scores (e.g. 70,80,90)"
          className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
        />

        <input
          value={perfForm.assignment_grades}
          onChange={(e) =>
            setPerfForm((f) => ({
              ...f,
              assignment_grades: e.target.value,
            }))
          }
          placeholder="Assignment grades (e.g. 75,85)"
          className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-200 outline-none"
        />
      </div>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={aiLoading || perfLoadingReal}
          className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition"
        >
          {aiLoading ? "Analyzing..." : "Analyze"}
        </button>

        {perfForm.subject && (
          <button
            type="button"
            onClick={analyzeRealPerformance}
            disabled={aiLoading || perfLoadingReal}
            className="px-4 py-3 rounded-xl border border-emerald-300 text-emerald-600 hover:bg-emerald-50 transition"
          >
            {perfLoadingReal ? "..." : "Real Data"}
          </button>
        )}
      </div>

      {aiError && <p className="text-red-500 text-sm">{aiError}</p>}
    </form>

    {/* RESULT */}
    {aiResult && (
      <div
        ref={aiResultRef}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="px-5 py-3 bg-emerald-50 border-b flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-emerald-700">
            {aiResult.subject} Analysis
          </span>
        </div>

        <div className="p-5 max-h-[50vh] overflow-y-auto text-sm text-gray-700">
          <SdAiMarkdown
            text={aiResult.analysis || JSON.stringify(aiResult)}
          />
        </div>
      </div>
    )}
  </div>
)}
            </div>
          </div>
        </div>
      )}

      {/* Unenroll confirmation modal */}
      {confirmUnenroll && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-md"
          onClick={(e) =>
            e.target === e.currentTarget && setConfirmUnenroll(null)
          }
        >
          <div
            className="glass-heavy border border-[var(--border)]/60 rounded-2xl p-8 w-full max-w-sm 
                          shadow-[0_32px_80px_-16px_rgba(0,0,0,0.4)] text-center
                          animate-[scale-in_0.3s_cubic-bezier(0.16,1,0.3,1)_both]"
          >
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text)] mb-3 sc-title">
              Unenroll from course?
            </h3>
            <p className="text-sm text-[var(--muted)] mb-7 font-medium leading-relaxed">
              You will lose access to{" "}
              <strong className="text-[var(--text)] font-bold">
                "{confirmUnenroll.title}"
              </strong>
              . You can re-enroll at any time.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirmUnenroll(null)}
                className="px-6 py-3 glass hover:bg-[var(--border)]/30 text-[var(--text)] rounded-xl text-sm font-bold 
                           border border-[var(--border)]/50 cursor-pointer transition-all duration-300 active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={unenroll}
                disabled={unenrollingId === confirmUnenroll.id}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-[0_8px_24px_-4px_rgba(239,68,68,0.4)] 
                           disabled:opacity-60 text-white rounded-xl text-sm font-bold border-none cursor-pointer transition-all duration-300
                           active:scale-95"
              >
                {unenrollingId === confirmUnenroll.id
                  ? "Leaving..."
                  : "Unenroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
