import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RECORDINGS_DIR = path.join(__dirname, "..", "..", "uploads", "recordings");

// Ensure directory exists at startup
if (!fs.existsSync(RECORDINGS_DIR)) fs.mkdirSync(RECORDINGS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RECORDINGS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `recording-${Date.now()}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowed = ["video/webm", "video/mp4", "video/ogg", "application/octet-stream"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error("Only video files are allowed."));
}

const recordingUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.RECORDING_MAX_SIZE_BYTES) || 2147483648 },
});

export default recordingUpload;
