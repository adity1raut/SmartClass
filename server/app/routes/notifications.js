import { Router } from "express";
import { requireSelf } from "../middleware/auth.js";
import { getNotifications, markAllRead } from "../controllers/notificationController.js";

const router = Router();

router.get("/:userId", requireSelf(), getNotifications);
router.patch("/read-all/:userId", requireSelf(), markAllRead);

export default router;
