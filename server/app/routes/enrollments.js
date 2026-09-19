import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  enroll,
  unenroll,
  getMyEnrollments,
  getCourseEnrollments,
  getCourseProgress,
} from "../controllers/enrollmentController.js";

const router = Router();

router.post("/", enroll);
router.delete("/", unenroll);
router.get("/my-courses", getMyEnrollments); // ?studentId=
router.get("/course/:courseId", requireRole("teacher"), getCourseEnrollments);
router.get("/progress", getCourseProgress); // ?studentId=&courseId=

export default router;
