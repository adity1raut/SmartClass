import mongoose from "mongoose";

const aiCourseOutlineSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", default: null },
    courseTitle: { type: String, required: true, trim: true },
    subject: { type: String, trim: true, default: "" },
    durationWeeks: { type: Number, default: 8 },
    targetLevel: { type: String, default: "intermediate" },
    content: { type: String, required: true }, // raw markdown from AI
  },
  { timestamps: true }
);

export default mongoose.model("AICourseOutline", aiCourseOutlineSchema);
