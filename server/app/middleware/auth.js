import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  // Accept JWT from httpOnly cookie or Authorization header (fallback)
  const token =
    req.cookies?.sc_token ||
    (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);

  if (!token) return res.status(401).json({ error: "Unauthorized." });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
}

/**
 * Role gate. Must run after requireAuth.
 *
 * The role is read from the verified token — never from the request body —
 * so a caller cannot claim a role they were not issued.
 *
 *   router.post("/", requireRole("teacher"), createAssignment);
 */
export function requireRole(...roles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized." });
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden." });
    next();
  };
}

/**
 * Ownership guard for `/:userId`-style routes that expose personal data.
 * Confirms the authenticated user is the subject of the request.
 */
export function requireSelf(paramName = "userId") {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized." });
    if (req.params[paramName] !== req.user.id) return res.status(403).json({ error: "Forbidden." });
    next();
  };
}

/**
 * Allow the subject of the route, OR any user holding one of `roles`.
 *
 * Used where a student may read their own record and a teacher may read any —
 * e.g. performance analysis and study plans.
 */
export function requireSelfOrRole(paramName, ...roles) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: "Unauthorized." });
    if (req.params[paramName] === req.user.id || roles.includes(req.user.role)) return next();
    res.status(403).json({ error: "Forbidden." });
  };
}
