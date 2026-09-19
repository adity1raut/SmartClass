import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  createLiveClass,
  getCourseLiveClasses,
  getLiveClass,
  updateLiveClass,
  deleteLiveClass,
  updateLiveClassStatus,
  joinLiveClass,
  getComments,
  addComment,
  getQuestions,
  addQuestion,
  markAnswered,
  uploadRecording,
} from "../controllers/liveClassController.js";
import recordingUpload from "../middleware/recordingUpload.js";

// Course-scoped live class routes (mergeParams inherits :courseId)
export const courseLiveClassRouter = Router({ mergeParams: true });
courseLiveClassRouter.post("/", requireRole("teacher"), createLiveClass);
courseLiveClassRouter.get("/", getCourseLiveClasses);

// Standalone live class routes
const router = Router();
router.get("/:id", getLiveClass);
router.patch("/:id", requireRole("teacher"), updateLiveClass);
router.delete("/:id", requireRole("teacher"), deleteLiveClass);
router.patch("/:id/status", requireRole("teacher"), updateLiveClassStatus);
router.post("/:id/join", joinLiveClass);
router.get("/:id/comments", getComments);
router.post("/:id/comments", addComment);
router.get("/:id/questions", getQuestions);
router.post("/:id/questions", addQuestion);
router.patch("/:id/questions/:qId/answer", requireRole("teacher"), markAnswered);
// Teacher uploads the recorded video after the class ends
router.post(
  "/:id/recording",
  requireRole("teacher"),
  recordingUpload.single("recording"),
  uploadRecording
);

export default router;
