import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  createCourse,
  getCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  unenrollCourse,
  getCourseStudents,
} from "../controllers/courseController.js";
import materialRoutes from "./materials.js";
import { courseAssignmentRouter } from "./assignments.js";
import { courseQuizRouter } from "./quizzes.js";
import { courseLiveClassRouter } from "./liveClass.js";

const router = Router();

router.post("/", requireRole("teacher"), createCourse);
router.get("/", getCourses);
router.get("/:id", getCourse);
router.patch("/:id", requireRole("teacher"), updateCourse);
router.delete("/:id", requireRole("teacher"), deleteCourse);

// Enrollment management
router.post("/:id/enroll", enrollCourse);
router.delete("/:id/enroll", unenrollCourse);
router.get("/:id/students", requireRole("teacher"), getCourseStudents);

// Nested resources
router.use("/:courseId/materials", materialRoutes);
router.use("/:courseId/assignments", courseAssignmentRouter);
router.use("/:courseId/quizzes", courseQuizRouter);
router.use("/:courseId/live-classes", courseLiveClassRouter);

export default router;
