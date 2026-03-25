import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import socket from "./socket";
import { ThemeContext, themes } from "./context/ThemeContext";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import ThemeApplier from "./theme/ThemeApplier";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("smartclass_user"));
    } catch {
      return null;
    }
  });
  const [themeName, setThemeName] = useState(
    () => localStorage.getItem("smartclass_theme") || "light",
  );

  useEffect(() => {
    if (user) socket.emit("authenticate", { userId: user.id });
  }, [user]);

  useEffect(() => {
    localStorage.setItem("smartclass_theme", themeName);
  }, [themeName]);

  const handleLogin = useCallback((userData) => {
    localStorage.setItem("smartclass_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("smartclass_user");
    setUser(null);
  }, []);

  const themeContextValue = useMemo(
    () => ({ themeName, setThemeName, themes }),
    [themeName],
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <ThemeApplier themeName={themeName} />
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] transition-colors relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-[var(--accent)]/15 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        </div>

        <div className="relative z-10">
          <BrowserRouter>
            {user ? (
              <ProtectedRoutes user={user} onLogout={handleLogout} />
            ) : (
              <Routes>
                <Route
                  path="/signin"
                  element={<SignIn onLogin={handleLogin} />}
                />
                <Route
                  path="/signup"
                  element={<SignUp onLogin={handleLogin} />}
                />
                <Route path="*" element={<Navigate to="/signin" />} />
              </Routes>
            )}
          </BrowserRouter>
        </div>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
