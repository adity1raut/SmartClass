import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import QuizResult from '../models/QuizResult.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import AIStudyPlan from '../models/AIStudyPlan.js';
import AICourseOutline from '../models/AICourseOutline.js';

const AI_SERVICE = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// ─── Internal helper: call Python agent ──────────────────────────────────────
async function callAgent(endpoint, body) {
  const res = await fetch(`${AI_SERVICE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || `Agent error ${res.status}`);
  return data;
}

async function proxyToAgent(endpoint, body, res) {
  try {
    const data = await callAgent(endpoint, body);
    res.json(data);
  } catch (err) {
    console.error(`AI proxy error [${endpoint}]:`, err.message);
    const isDown = err.message.includes('fetch') || err.message.includes('ECONNREFUSED');
    res.status(isDown ? 503 : 500).json({
      error: isDown
        ? 'AI service unavailable. Make sure the agent server is running on port 8000.'
        : err.message,
    });
  }
}

// ─── Pass-through routes (no DB) ─────────────────────────────────────────────
export const chat               = (req, res) => proxyToAgent('/chat',                req.body, res);
export const summarize          = (req, res) => proxyToAgent('/summarize',           req.body, res);
export const explain            = (req, res) => proxyToAgent('/explain',             req.body, res);
export const agent              = (req, res) => proxyToAgent('/agent',               req.body, res);

// ─── POST /api/ai/generate-quiz ── generate (no save) ────────────────────────
export const generateQuiz = (req, res) => proxyToAgent('/generate-quiz', req.body, res);

// ─── POST /api/ai/courses/:courseId/save-quiz ─────────────────────────────────
// Saves AI-generated (and optionally teacher-edited) questions as a real Quiz in DB.
export async function saveQuizToCourse(req, res) {
  try {
    const { courseId } = req.params;
    const { title, questions, teacherId, timeLimit, dueDate } = req.body;

    if (!title || !Array.isArray(questions) || questions.length === 0 || !teacherId)
      return res.status(400).json({ error: 'title, questions[], and teacherId are required.' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.teacher.toString() !== teacherId)
      return res.status(403).json({ error: 'Only the course teacher can save quizzes.' });

    // Map from AI format → DB format
    // AI:  { question, options[], correct_answer (index), explanation }
    // DB:  { question, options[], correctOption (index), points }
    const dbQuestions = questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctOption: q.correct_answer ?? q.correctOption ?? 0,
      points: q.points ?? 1,
    }));

    const quiz = await Quiz.create({
      title,
      description: `AI-generated quiz`,
      course: courseId,
      createdBy: teacherId,
      questions: dbQuestions,
      timeLimit: timeLimit || 0,
      dueDate: dueDate || null,
    });

    res.status(201).json(formatQuiz(quiz));
  } catch (err) {
    console.error('saveQuizToCourse error:', err);
    res.status(500).json({ error: 'Failed to save quiz.' });
  }
}

// ─── POST /api/ai/feedback ── AI feedback on assignment submission ─────────────
export const feedback = (req, res) => proxyToAgent('/feedback', req.body, res);

// ─── POST /api/ai/submissions/:submissionId/feedback ──────────────────────────
// Generate AI feedback on a submission AND save it to Submission.feedback field
export async function feedbackAndSave(req, res) {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId).populate('assignment', 'title description maxScore');
    if (!submission) return res.status(404).json({ error: 'Submission not found.' });

    const aiData = await callAgent('/feedback', {
      assignment_title: submission.assignment.title,
      assignment_description: submission.assignment.description,
      student_submission: submission.content,
      max_score: submission.assignment.maxScore,
    });

    // Save AI feedback to DB
    submission.feedback = aiData.feedback;
    if (submission.status === 'submitted') submission.status = 'graded';
    await submission.save();

    res.json({ ...aiData, submissionId, saved: true });
  } catch (err) {
    console.error('feedbackAndSave error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate feedback.' });
  }
}

// ─── POST /api/ai/analyze-performance ── pass-through ────────────────────────
export const analyzePerformance = (req, res) => proxyToAgent('/analyze-performance', req.body, res);

// ─── GET /api/ai/students/:studentId/performance-context ─────────────────────
// Fetch real quiz scores + assignment grades for a student from DB, then run AI analysis
export async function getPerformanceContext(req, res) {
  try {
    const { studentId } = req.params;

    const courses = await Course.find({ enrolledStudents: studentId });
    const courseIds = courses.map((c) => c._id);

    const [quizResults, submissions] = await Promise.all([
      QuizResult.find({
        student: studentId,
        quiz: { $in: await Quiz.find({ course: { $in: courseIds } }).distinct('_id') },
      }).populate('quiz', 'title course'),
      Submission.find({
        student: studentId,
        assignment: { $in: await Assignment.find({ course: { $in: courseIds } }).distinct('_id') },
        status: 'graded',
      }).select('score assignment'),
    ]);

    // Group by course
    const courseMap = {};
    for (const c of courses) {
      courseMap[c._id.toString()] = { courseId: c._id.toString(), title: c.title, quizScores: [], assignmentGrades: [] };
    }

    for (const r of quizResults) {
      const cId = r.quiz?.course?.toString();
      if (cId && courseMap[cId] && r.totalPoints > 0) {
        courseMap[cId].quizScores.push(Math.round((r.score / r.totalPoints) * 100));
      }
    }

    // For assignments we need courseId — join via Assignment
    const assignmentIds = submissions.map((s) => s.assignment);
    const assignments = await Assignment.find({ _id: { $in: assignmentIds } }).select('course maxScore');
    const assignMap = Object.fromEntries(assignments.map((a) => [a._id.toString(), a]));
    for (const s of submissions) {
      const asn = assignMap[s.assignment?.toString()];
      if (asn && asn.maxScore > 0) {
        const cId = asn.course.toString();
        if (courseMap[cId]) {
          courseMap[cId].assignmentGrades.push(Math.round((s.score / asn.maxScore) * 100));
        }
      }
    }

    // Return structured data per course
    const performanceData = Object.values(courseMap).filter(
      (c) => c.quizScores.length > 0 || c.assignmentGrades.length > 0
    );

    res.json({ courses: performanceData, totalCourses: courses.length });
  } catch (err) {
    console.error('getPerformanceContext error:', err);
    res.status(500).json({ error: 'Failed to fetch performance data.' });
  }
}

// ─── POST /api/ai/analyze-performance-real ───────────────────────────────────
// Fetch real data from DB for a student + subject, then analyze with AI
export async function analyzeRealPerformance(req, res) {
  try {
    const { studentId, subject } = req.body;
    if (!studentId || !subject)
      return res.status(400).json({ error: 'studentId and subject are required.' });

    const courses = await Course.find({ enrolledStudents: studentId, subject: new RegExp(subject, 'i') });
    const courseIds = courses.map((c) => c._id);

    const quizScores = [];
    const assignmentGrades = [];

    if (courseIds.length > 0) {
      const qrs = await QuizResult.find({
        student: studentId,
        quiz: { $in: await Quiz.find({ course: { $in: courseIds } }).distinct('_id') },
      });
      for (const r of qrs) {
        if (r.totalPoints > 0) quizScores.push(Math.round((r.score / r.totalPoints) * 100));
      }

      const subs = await Submission.find({
        student: studentId,
        assignment: { $in: await Assignment.find({ course: { $in: courseIds } }).distinct('_id') },
        status: 'graded',
      }).populate('assignment', 'maxScore');
      for (const s of subs) {
        if (s.assignment?.maxScore > 0)
          assignmentGrades.push(Math.round((s.score / s.assignment.maxScore) * 100));
      }
    }

    const aiData = await callAgent('/analyze-performance', {
      subject,
      quiz_scores: quizScores,
      assignment_grades: assignmentGrades,
      course_progress: Math.round(courseIds.length > 0 ? (quizScores.length / Math.max(quizScores.length + 2, 5)) * 100 : 0),
    });

    res.json({ ...aiData, quizScores, assignmentGrades });
  } catch (err) {
    console.error('analyzeRealPerformance error:', err);
    res.status(500).json({ error: err.message || 'Failed to analyze performance.' });
  }
}

// ─── POST /api/ai/generate-assignment ────────────────────────────────────────
export async function generateAssignment(req, res) {
  const { course_title, topic, difficulty = 'intermediate', max_score = 100 } = req.body;
  if (!course_title || !topic)
    return res.status(400).json({ error: 'course_title and topic are required.' });
  return proxyToAgent('/agent', {
    task: `Create a detailed assignment for a course on "${course_title}" about "${topic}". Include: a clear description of what students must do, learning objectives, deliverables, and grading criteria. Level: ${difficulty}. Max score: ${max_score} points. Use plain text paragraphs (no JSON).`,
  }, res);
}

// ─── POST /api/ai/generate-class-agenda ──────────────────────────────────────
export async function generateClassAgenda(req, res) {
  const { course_title, topic, duration_minutes = 60 } = req.body;
  if (!course_title || !topic)
    return res.status(400).json({ error: 'course_title and topic are required.' });
  return proxyToAgent('/agent', {
    task: `Create a detailed ${duration_minutes}-minute live class agenda for "${topic}" in the course "${course_title}". Include: learning objectives, timestamped segments, activities, discussion questions, and key takeaways. Format with clear headings.`,
  }, res);
}

// ─── STUDY PLANS ─────────────────────────────────────────────────────────────

// POST /api/ai/study-plan  — generate (no save)
export const studyPlan = (req, res) => proxyToAgent('/study-plan', req.body, res);

// POST /api/ai/students/:studentId/study-plans  — generate + save to DB
export async function generateAndSaveStudyPlan(req, res) {
  try {
    const { studentId } = req.params;
    const { student_name, enrolled_courses, weak_areas, available_hours_per_week, goals } = req.body;

    if (!student_name || !enrolled_courses?.length)
      return res.status(400).json({ error: 'student_name and enrolled_courses are required.' });

    const aiData = await callAgent('/study-plan', {
      student_name,
      enrolled_courses,
      weak_areas: weak_areas || [],
      available_hours_per_week: available_hours_per_week || 10,
      goals: goals || '',
    });

    const plan = await AIStudyPlan.create({
      student: studentId,
      title: `Study Plan — ${enrolled_courses.slice(0, 2).join(', ')}`,
      content: aiData.study_plan,
      courses: enrolled_courses,
      hoursPerWeek: available_hours_per_week || 10,
      goals: goals || '',
    });

    res.status(201).json({ ...aiData, savedPlan: formatPlan(plan) });
  } catch (err) {
    console.error('generateAndSaveStudyPlan error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate study plan.' });
  }
}

// POST /api/ai/students/:studentId/study-plans/save — save an already-generated plan
export async function saveStudyPlan(req, res) {
  try {
    const { studentId } = req.params;
    const { content, courses, hoursPerWeek, goals } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required.' });

    const plan = await AIStudyPlan.create({
      student: studentId,
      title: `Study Plan — ${(courses || []).slice(0, 2).join(', ') || 'General'}`,
      content,
      courses: courses || [],
      hoursPerWeek: hoursPerWeek || 10,
      goals: goals || '',
    });
    res.status(201).json(formatPlan(plan));
  } catch (err) {
    console.error('saveStudyPlan error:', err);
    res.status(500).json({ error: 'Failed to save study plan.' });
  }
}

// GET /api/ai/students/:studentId/study-plans
export async function getStudyPlans(req, res) {
  try {
    const plans = await AIStudyPlan.find({ student: req.params.studentId }).sort({ createdAt: -1 });
    res.json(plans.map(formatPlan));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch study plans.' });
  }
}

// DELETE /api/ai/study-plans/:id
export async function deleteStudyPlan(req, res) {
  try {
    const plan = await AIStudyPlan.findById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found.' });
    if (plan.student.toString() !== req.user.id.toString())
      return res.status(403).json({ error: 'Not authorized.' });
    await plan.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete study plan.' });
  }
}

// ─── COURSE OUTLINES ──────────────────────────────────────────────────────────

// POST /api/ai/course-outline  — generate (no save)
export const courseOutline = (req, res) => proxyToAgent('/course-outline', req.body, res);

// POST /api/ai/teachers/:teacherId/outlines  — generate + save to DB
export async function generateAndSaveOutline(req, res) {
  try {
    const { teacherId } = req.params;
    const { course_title, subject, duration_weeks, target_level, learning_objectives, courseId } = req.body;

    if (!course_title || !subject)
      return res.status(400).json({ error: 'course_title and subject are required.' });

    const aiData = await callAgent('/course-outline', {
      course_title,
      subject,
      duration_weeks: duration_weeks || 8,
      target_level: target_level || 'intermediate',
      learning_objectives: learning_objectives || '',
    });

    const outline = await AICourseOutline.create({
      teacher: teacherId,
      course: courseId || null,
      courseTitle: course_title,
      subject,
      durationWeeks: duration_weeks || 8,
      targetLevel: target_level || 'intermediate',
      content: aiData.outline,
    });

    res.status(201).json({ ...aiData, savedOutline: formatOutline(outline) });
  } catch (err) {
    console.error('generateAndSaveOutline error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate outline.' });
  }
}

// POST /api/ai/teachers/:teacherId/outlines/save — save already-generated outline
export async function saveOutline(req, res) {
  try {
    const { teacherId } = req.params;
    const { content, courseTitle, subject, durationWeeks, targetLevel, courseId } = req.body;
    if (!content || !courseTitle) return res.status(400).json({ error: 'content and courseTitle are required.' });

    const outline = await AICourseOutline.create({
      teacher: teacherId,
      course: courseId || null,
      courseTitle,
      subject: subject || '',
      durationWeeks: durationWeeks || 8,
      targetLevel: targetLevel || 'intermediate',
      content,
    });
    res.status(201).json(formatOutline(outline));
  } catch (err) {
    res.status(500).json({ error: 'Failed to save outline.' });
  }
}

// GET /api/ai/teachers/:teacherId/outlines
export async function getOutlines(req, res) {
  try {
    const outlines = await AICourseOutline.find({ teacher: req.params.teacherId })
      .populate('course', 'title')
      .sort({ createdAt: -1 });
    res.json(outlines.map(formatOutline));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch outlines.' });
  }
}

// DELETE /api/ai/outlines/:id
export async function deleteOutline(req, res) {
  try {
    const outline = await AICourseOutline.findById(req.params.id);
    if (!outline) return res.status(404).json({ error: 'Outline not found.' });
    if (outline.teacher.toString() !== req.user.id.toString())
      return res.status(403).json({ error: 'Not authorized.' });
    await outline.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete outline.' });
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatQuiz(q) {
  return {
    id: q._id,
    title: q.title,
    course: q.course,
    questions: q.questions,
    timeLimit: q.timeLimit,
    dueDate: q.dueDate,
    isActive: q.isActive,
    questionCount: q.questions?.length ?? 0,
    createdAt: q.createdAt,
  };
}

function formatPlan(p) {
  return {
    _id: p._id,
    id: p._id,
    title: p.title,
    content: p.content,
    courses: p.courses,
    hoursPerWeek: p.hoursPerWeek,
    goals: p.goals,
    createdAt: p.createdAt,
  };
}

function formatOutline(o) {
  return {
    id: o._id,
    courseTitle: o.courseTitle,
    subject: o.subject,
    durationWeeks: o.durationWeeks,
    targetLevel: o.targetLevel,
    content: o.content,
    course: o.course ? { id: o.course._id || o.course, title: o.course.title } : null,
    createdAt: o.createdAt,
  };
}
