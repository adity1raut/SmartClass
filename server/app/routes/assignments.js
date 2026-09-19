import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  getMySubmission,
  gradeSubmission,
  addAttachment,
  deleteAttachment,
} from "../controllers/assignmentController.js";
import documentUpload from "../middleware/documentUpload.js";

// Course-scoped assignment routes (mergeParams inherits :courseId)
export const courseAssignmentRouter = Router({ mergeParams: true });
courseAssignmentRouter.post("/", requireRole("teacher"), createAssignment);
courseAssignmentRouter.get("/", getCourseAssignments);

// Standalone assignment routes
const router = Router();
router.get("/:id", getAssignment);
router.patch("/:id", requireRole("teacher"), updateAssignment);
router.delete("/:id", requireRole("teacher"), deleteAssignment);
router.post("/:id/submit", requireRole("student"), documentUpload.single("file"), submitAssignment);
router.get("/:id/submissions", requireRole("teacher"), getSubmissions);
router.get("/:id/my-submission", getMySubmission);
router.patch("/submissions/:submissionId/grade", requireRole("teacher"), gradeSubmission);
router.post(
  "/:id/attachments",
  requireRole("teacher"),
  documentUpload.single("file"),
  addAttachment
);
router.delete("/:id/attachments/:attachmentId", requireRole("teacher"), deleteAttachment);

export default router;
