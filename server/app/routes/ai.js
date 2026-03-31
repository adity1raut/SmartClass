import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
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
router.post("/courses/:courseId/save-quiz", saveQuizToCourse);

// ─── Submission feedback → DB ─────────────────────────────────────────────────
router.post("/submissions/:submissionId/feedback", feedbackAndSave);

// ─── Performance with real DB data ───────────────────────────────────────────
router.get("/students/:studentId/performance-context", getPerformanceContext);
router.post("/analyze-performance-real", analyzeRealPerformance);

// ─── Study plans CRUD ─────────────────────────────────────────────────────────
router.post("/students/:studentId/study-plans", generateAndSaveStudyPlan);
router.post("/students/:studentId/study-plans/save", saveStudyPlan);
router.get("/students/:studentId/study-plans", getStudyPlans);
router.delete("/study-plans/:id", deleteStudyPlan);

// ─── Course outlines CRUD ─────────────────────────────────────────────────────
router.post("/teachers/:teacherId/outlines", generateAndSaveOutline);
router.post("/teachers/:teacherId/outlines/save", saveOutline);
router.get("/teachers/:teacherId/outlines", getOutlines);
router.delete("/outlines/:id", deleteOutline);

export default router;
