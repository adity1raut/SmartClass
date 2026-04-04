import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeContext, themes as themeMap } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getSocket } from "../socket";
import { apiFetch } from "../utils/api.js";
import { Sun, Moon, Sparkles } from "lucide-react";
import { Bell } from "lucide-react";
function timeAgo(date) {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const THEME_META = {
  [themeMap.light]: {
    label: "Light",
    icon: Sun,
  },
  [themeMap.dark]: {
    label: "Dark",
<<<<<<< HEAD
    icon: Moon,
=======
    icon: "🌙",
    color: "from-indigo-500 to-purple-600",
>>>>>>> 42795c9a6a2ed72e942e6619110abc54bb76c281
  },
};

const AI_TABS = [
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "quiz", label: "Quiz Generator", icon: "📝" },
  { id: "summarize", label: "Summarize", icon: "📋" },
  { id: "feedback", label: "Feedback", icon: "✅" },
  { id: "study-plan", label: "Study Plan", icon: "📅" },
  { id: "explain", label: "Explain", icon: "💡" },
  { id: "performance", label: "Performance", icon: "📊" },
  { id: "course-outline", label: "Course Outline", icon: "🎓" },
  { id: "agent", label: "Agent", icon: "🤖" },
];

const NAV_LINKS = [
  { label: "Dashboard", icon: "🏠", path: "/" },
  {
    label: "AI Playground",
    icon: "🤖",
    path: "/ai-playground/chat",
    matchPrefix: "/ai-playground",
    dropdown: AI_TABS.map((t) => ({
      label: t.label,
      icon: t.icon,
      path: `/ai-playground/${t.id}`,
    })),
  },
  { label: "Live Classes", icon: "📹", path: "/live-classes" },
];

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeName, setThemeName } = useContext(ThemeContext);
  const { user, logout } = useAuth();
  const [notifs, setNotifs] = useState([]);
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navDropdown, setNavDropdown] = useState(null); // label of open dropdown
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);
  const mobileMenuRef = useRef(null);
  const navDropdownRef = useRef(null);

  const themeKeys = Object.keys(themeMap || {});
  const unread = notifs.filter((n) => !n.read).length;
  const isAuthenticated = user && user.role !== "guest";

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    apiFetch(`/api/notifications/${user.id}`)
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setNotifs(d));

    const socket = getSocket(user.id);

    // Single unified listener — backend persists to DB before emitting
    socket.on("notification:new", (notif) => {
      setNotifs((prev) => [{ ...notif, read: false }, ...prev]);
    });

    return () => {
      socket.off("notification:new");
    };
  }, [user?.id, isAuthenticated]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target))
        setMobileMenuOpen(false);
      if (navDropdownRef.current && !navDropdownRef.current.contains(e.target))
        setNavDropdown(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const cycleTheme = () => {
    setThemeName((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <nav
      data-theme={themeName}
      className={`sticky top-0 z-50 px-4 sm:px-6 h-16 flex items-center justify-between
  transition-all duration-500
  ${
    scrolled
      ? "backdrop-blur-xl bg-white/70 dark:bg-black/40 border-b border-[var(--border)] shadow-md"
      : "bg-transparent"
  }`}
    >
      {/* LEFT */}
      <div className="flex items-center gap-5 min-w-0 flex-1">
        {/* LOGO */}
        <button
          onClick={() =>
            navigate(
              isAuthenticated
                ? user.role === "teacher"
                  ? "/teacher-dashboard"
                  : "/student-dashboard"
                : "/",
            )
          }
          className="flex items-center gap-3 group"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center
        bg-gradient-to-br from-[var(--accent)] to-green-600 text-white
        shadow-md group-hover:scale-110 transition-all duration-300"
          >
            🎓
          </div>

          <div className="hidden sm:block leading-tight select-none">
            {/* Brand Name */}
            <p
              className="
    text-lg font-extrabold tracking-tight
    bg-gradient-to-r from-green-500 via-emerald-500 to-green-600
    bg-clip-text text-transparent
    group-hover:scale-[1.03]
    transition-all duration-300
  "
            >
              Smart<span className=" text-[var(--text)]">Class</span>
            </p>

            {/* Tagline */}
            <p
              className="
    text-[10px] font-medium tracking-wide
    text-gray-500
    group-hover:text-green-500
    transition-all duration-300
  "
            >
              Learn • Grow • Build
            </p>
          </div>
        </button>

        {/* DESKTOP NAV */}
        {isAuthenticated && (
          <div className="hidden lg:flex items-center gap-2 ml-4">
            {NAV_LINKS.map((link) => {
              const active = link.matchPrefix
                ? location.pathname.startsWith(link.matchPrefix)
                : location.pathname === link.path;

              const isOpen = navDropdown === link.label;

              return (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => {
                      if (link.dropdown) {
                        setNavDropdown(isOpen ? null : link.label);
                      } else {
                        navigate(link.path);
                        setNavDropdown(null);
                      }
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
  ${
    active
      ? " text-white shadow-[0_6px_20px_-6px_rgba(34,197,94,0.6)]"
      : "text-[var(--muted)] hover:bg-green-500/10 hover:text-green-500"
  }`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                    {link.dropdown && (
                      <span
                        className={`text-xs transition-transform ${isOpen ? "rotate-180" : ""}`}
                      >
                        ▾
                      </span>
                    )}
                  </button>

                  {/* DROPDOWN */}
                  {link.dropdown && isOpen && (
                    <div
                      className="absolute top-full mt-2 w-52 rounded-2xl
                  bg-white dark:bg-black border border-[var(--border)]
                  shadow-xl overflow-hidden animate-[scale-in_0.2s_ease]"
                    >
                      {link.dropdown.map((item) => {
                        const itemActive = location.pathname === item.path;

                        return (
                          <button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path);
                              setNavDropdown(null);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition
                          ${
                            itemActive
                              ? "bg-[var(--accent)]/15 text-[var(--accent)] font-semibold"
                              : "hover:bg-[var(--accent)]/8"
                          }`}
                          >
                            <span>{item.icon}</span>
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

<<<<<<< HEAD
      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {/* THEME */}
=======
      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Desktop theme toggle: Light / Dark */}
        <div className="hidden lg:flex items-center gap-0.5 p-1 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]">
          {Object.keys(themeMap).map((key) => {
            const active = themeName === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setThemeName(key)}
                title={THEME_META[key]?.label || key}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  active
                    ? "bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_4px_12px_-4px_var(--accent)]"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]"
                } active:scale-95`}
              >
                <span>{THEME_META[key]?.icon || "🎨"}</span>
                <span className="hidden xl:inline">
                  {THEME_META[key]?.label || key}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile: icon-only toggle */}
>>>>>>> 42795c9a6a2ed72e942e6619110abc54bb76c281
        <button
          onClick={cycleTheme}
<<<<<<< HEAD
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)]
  hover:bg-[var(--accent)]/10 transition-all duration-200"
        >
          {(() => {
            const Icon = THEME_META[themeName]?.icon;
            return (
              <>
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold hidden sm:inline">
                  {THEME_META[themeName]?.label}
                </span>
              </>
            );
          })()}
=======
          className="lg:hidden h-9 w-9 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]
                     text-sm cursor-pointer hover:bg-[var(--accent)]/12
                     transition-all duration-200 active:scale-90 flex items-center justify-center
                     hover:border-[var(--accent)]/40"
          title={`Switch to ${themeName === "light" ? "dark" : "light"} mode`}
          aria-label="Toggle theme"
        >
          {themeName === "dark" ? "☀️" : "🌙"}
>>>>>>> 42795c9a6a2ed72e942e6619110abc54bb76c281
        </button>

        {isAuthenticated ? (
          <>
            {/* NOTIFICATIONS */}
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen(!open)}
                className="relative h-9 w-9 flex items-center justify-center rounded-xl
            hover:bg-[var(--accent)]/10 transition"
              >
                <Bell className="w-5 h-5 text-[var(--text)]" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 text-[10px] bg-red-500 text-white px-1.5 rounded-full">
                    {unread}
                  </span>
                )}
              </button>

              {open && (
                <div
                  className="absolute right-0 top-12 w-80 rounded-2xl bg-[var(--surface)] border border-[var(--border)]
              shadow-xl overflow-hidden animate-[scale-in_0.2s_ease]"
                >
                  <div className="px-4 py-3 border-b border-[var(--border)] font-semibold text-[var(--text)]">
                    Notifications
                  </div>

                  <div className="max-h-64 overflow-y-auto">
                    {notifs.length === 0 ? (
                      <p className="text-sm text-[var(--muted)] p-4 text-center">
                        No notifications
                      </p>
                    ) : (
                      notifs.map((n) => (
                        <div
                          key={n.id}
                          className="px-4 py-3 text-sm hover:bg-[var(--accent)]/5 border-b border-[var(--border)]/10 last:border-b-0"
                        >
                          <p className="text-[var(--text)] leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-[var(--muted)] mt-1">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* USER */}
            <div
              className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl border border-[var(--border)]
  shadow-sm hover:shadow-md hover:border-[var(--accent)]/30 transition-all duration-200"
            >
              {/* Text */}
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--text)] leading-tight">
                  {user.name}
                </p>
                <p className="text-[11px] text-[var(--muted)]">{user.email}</p>
              </div>

              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-green-600
    text-white flex items-center justify-center font-bold shadow-sm"
              >
                {user.name?.charAt(0)}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="hidden lg:block px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border)]
          text-[var(--text)] hover:bg-[var(--accent)]/10 hover:border-[var(--accent)]/30 transition-all duration-200"
            >
              Logout
            </button>

            {/* MOBILE MENU */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden h-9 w-9 rounded-xl flex items-center justify-center border border-[var(--border)]
          hover:bg-[var(--accent)]/10 transition-all duration-200"
            >
              ☰
            </button>

            {mobileMenuOpen && (
              <div
                className="absolute right-4 top-16 w-64 rounded-2xl bg-[var(--surface)] border border-[var(--border)]
            shadow-xl p-2 animate-[scale-in_0.2s_ease]"
              >
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-[var(--accent)]/10
                text-[var(--text)] font-medium transition-all duration-200 flex items-center gap-3"
                  >
                    <span className="text-lg">{link.icon}</span>
                    {link.label}
                  </button>
                ))}

                <div className="border-t border-[var(--border)] my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl
              font-medium transition-all duration-200 flex items-center gap-3"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl border"
            >
              Home
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-4 py-2 rounded-xl bg-[var(--accent)] text-white font-semibold"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
