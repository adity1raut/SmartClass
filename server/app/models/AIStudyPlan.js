import mongoose from 'mongoose';

const aiStudyPlanSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, trim: true, default: '' },
    content: { type: String, required: true },           // raw markdown from AI
    courses: [{ type: String, trim: true }],             // course name strings
    hoursPerWeek: { type: Number, default: 10 },
    goals: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('AIStudyPlan', aiStudyPlanSchema);
