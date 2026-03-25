import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "../pages/SignIn";
import SignUp from "../pages/SignUp";

function PublicRoutes({ onLogin }) {
  return (
    <Routes>
      <Route path="/signin" element={<SignIn onLogin={onLogin} />} />
      <Route path="/signup" element={<SignUp onLogin={onLogin} />} />
      <Route path="/" element={<Navigate to="/signin" />} />
      <Route path="*" element={<Navigate to="/signin" />} />
    </Routes>
  );
}

export default PublicRoutes;
