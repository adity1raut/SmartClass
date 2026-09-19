import { Router } from "express";
import { requireAuth, requireRole, requireSelf, requireSelfOrRole } from "../middleware/auth.js";
import {
  // Pass-through (no DB)
  chat,
  summarize,
  explain,
  agent,
  generateQuiz,
  feedback,
  studyPlan,
  courseOutline,
  analyzePerformance,
  generateAssignment,
  generateClassAgenda,
  // Quiz → DB
  saveQuizToCourse,
  // Submission feedback → DB
  feedbackAndSave,
  // Performance with real data
  getPerformanceContext,
  analyzeRealPerformance,
  // Study plans CRUD
  generateAndSaveStudyPlan,
  saveStudyPlan,
  getStudyPlans,
  deleteStudyPlan,
  // Outlines CRUD
  generateAndSaveOutline,
  saveOutline,
  getOutlines,
  deleteOutline,
} from "../controllers/aiController.js";

const router = Router();
router.use(requireAuth);

// ─── Pass-through AI routes ───────────────────────────────────────────────────
router.post("/chat", chat);
router.post("/summarize", summarize);
router.post("/explain", explain);
router.post("/agent", agent);
router.post("/generate-quiz", generateQuiz);
router.post("/feedback", feedback);
router.post("/study-plan", studyPlan);
router.post("/course-outline", courseOutline);
router.post("/analyze-performance", analyzePerformance);
router.post("/generate-assignment", generateAssignment);
router.post("/generate-class-agenda", generateClassAgenda);

// ─── Quiz → DB ────────────────────────────────────────────────────────────────
// Teacher saves AI-generated (and optionally edited) quiz to a course
router.post("/courses/:courseId/save-quiz", requireRole("teacher"), saveQuizToCourse);

// ─── Submission feedback → DB ─────────────────────────────────────────────────
router.post("/submissions/:submissionId/feedback", requireRole("teacher"), feedbackAndSave);

// ─── Performance with real DB data ───────────────────────────────────────────
router.get(
  "/students/:studentId/performance-context",
  requireSelfOrRole("studentId", "teacher"),
  getPerformanceContext
);
router.post("/analyze-performance-real", analyzeRealPerformance);

// ─── Study plans CRUD ─────────────────────────────────────────────────────────
router.post("/students/:studentId/study-plans", requireSelf("studentId"), generateAndSaveStudyPlan);
router.post("/students/:studentId/study-plans/save", requireSelf("studentId"), saveStudyPlan);
router.get(
  "/students/:studentId/study-plans",
  requireSelfOrRole("studentId", "teacher"),
  getStudyPlans
);
router.delete("/study-plans/:id", deleteStudyPlan);

// ─── Course outlines CRUD ─────────────────────────────────────────────────────
router.post(
  "/teachers/:teacherId/outlines",
  requireRole("teacher"),
  requireSelf("teacherId"),
  generateAndSaveOutline
);
router.post(
  "/teachers/:teacherId/outlines/save",
  requireRole("teacher"),
  requireSelf("teacherId"),
  saveOutline
);
router.get(
  "/teachers/:teacherId/outlines",
  requireRole("teacher"),
  requireSelf("teacherId"),
  getOutlines
);
router.delete("/outlines/:id", deleteOutline);

export default router;
