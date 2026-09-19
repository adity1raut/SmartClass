import { Router } from "express";
import { requireRole } from "../middleware/auth.js";
import {
  addMaterial,
  getCourseMaterials,
  updateMaterial,
  deleteMaterial,
  markComplete,
  unmarkComplete,
  getMaterialProgress,
  uploadMaterialFile,
} from "../controllers/materialController.js";
import materialUpload from "../middleware/materialUpload.js";

const router = Router({ mergeParams: true }); // inherits :courseId from parent

router.post("/upload", requireRole("teacher"), materialUpload.single("file"), uploadMaterialFile);
router.post("/", requireRole("teacher"), addMaterial);
router.get("/", getCourseMaterials);
router.get("/progress", getMaterialProgress); // ?studentId=
router.patch("/:materialId", requireRole("teacher"), updateMaterial);
router.delete("/:materialId", requireRole("teacher"), deleteMaterial);
router.post("/:materialId/complete", markComplete);
router.delete("/:materialId/complete", unmarkComplete);

export default router;
