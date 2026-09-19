import { Router } from "express";
import { requireRole, requireSelf } from "../middleware/auth.js";
import { getTeacherDashboard, getStudentDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.get(
  "/teachers/:id/dashboard",
  requireRole("teacher"),
  requireSelf("id"),
  getTeacherDashboard
);
router.get("/students/:id/dashboard", requireSelf("id"), getStudentDashboard);

export default router;
