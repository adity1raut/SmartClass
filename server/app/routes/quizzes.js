import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  createQuiz,
  getCourseQuizzes,
  getQuiz,
  updateQuiz,
  deleteQuiz,
  submitQuiz,
  getQuizResults,
  getMyResult,
} from "../controllers/quizController.js";

// Course-scoped quiz routes (mergeParams inherits :courseId)
export const courseQuizRouter = Router({ mergeParams: true });
courseQuizRouter.post("/", requireRole("teacher"), createQuiz);
courseQuizRouter.get("/", getCourseQuizzes);

// Standalone quiz routes
const router = Router();
router.get("/:id", getQuiz);
router.patch("/:id", requireRole("teacher"), updateQuiz);
router.delete("/:id", requireRole("teacher"), deleteQuiz);
router.post("/:id/submit", requireRole("student"), submitQuiz);
router.get("/:id/results", requireRole("teacher"), getQuizResults);
router.get("/:id/my-result", getMyResult);

export default router;
