const scoreCls = (pct) =>
  pct >= 70 ? "bg-emerald-100 text-emerald-700" : pct >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-600";

function AssignmentCard({ 
  assignment, 
  isTeacher, 
  mySubmission, 
  submissions, 
  submissionText,
  onSubmit, 
  onToggleSubs, 
  onDelete,
  onGrade 
}) {
  const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date();

  return (
    <div className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)] shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--text)] mb-1">{assignment.title}</p>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)] mb-1">
            {assignment.dueDate && (
              <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                {isOverdue ? "⚠ Overdue · " : "📅 Due: "}
                {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
            )}
            <span>Max: {assignment.maxScore} pts</span>
          </div>
          {assignment.description && (
            <p className="text-sm text-[var(--muted)] leading-relaxed mt-1">{assignment.description}</p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isTeacher ? (
            <>
              <button onClick={() => onToggleSubs(assignment.id)}
                className="px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg text-xs font-semibold border-none cursor-pointer">
                {submissions !== undefined ? "Hide" : "Submissions"}
              </button>
              <button onClick={() => onDelete(assignment.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold border-none cursor-pointer">
                Delete
              </button>
            </>
          ) : mySubmission ? (
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              mySubmission.status === "graded"
                ? scoreCls((mySubmission.score / assignment.maxScore) * 100)
                : "bg-emerald-100 text-emerald-700"
            }`}>
              {mySubmission.status === "graded"
                ? `${mySubmission.score}/${assignment.maxScore}`
                : mySubmission.status === "late" ? "⏰ Late" : "✓ Submitted"}
            </span>
          ) : null}
        </div>
      </div>

      {!isTeacher && !mySubmission && (
        <StudentSubmissionForm 
          assignmentId={assignment.id}
          submissionText={submissionText}
          onSubmit={onSubmit}
        />
      )}

      {!isTeacher && mySubmission && (
        <SubmissionView submission={mySubmission} />
      )}

      {isTeacher && submissions !== undefined && (
        <SubmissionsList 
          submissions={submissions}
          assignment={assignment}
          onGrade={onGrade}
        />
      )}
    </div>
  );
}

function StudentSubmissionForm({ assignmentId, submissionText, onSubmit }) {
  const inputCls = "w-full px-3.5 py-2.5 border border-[var(--border)] rounded-lg text-sm outline-none resize-y focus:border-[var(--accent)] transition-colors bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]/70";
  
  return (
    <div className="mt-4 space-y-2">
      <textarea className={`${inputCls} min-h-[80px]`}
        placeholder="Write your answer here..."
        value={submissionText || ""}
        onChange={e => onSubmit(assignmentId, e.target.value, true)} />
      <div className="flex justify-end">
        <button onClick={() => onSubmit(assignmentId, submissionText, false)}
          disabled={!submissionText?.trim()}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-600 rounded-lg text-xs font-semibold border-none cursor-pointer disabled:cursor-not-allowed">
          Submit
        </button>
      </div>
    </div>
  );
}

function SubmissionView({ submission }) {
  return (
    <div className="mt-3 bg-[var(--bg)] rounded-lg px-4 py-3 border border-[var(--border)] space-y-2">
      <p className="text-xs font-semibold text-[var(--muted)]">Your submission</p>
      <p className="text-sm text-[var(--text)] leading-relaxed">{submission.content}</p>
      {submission.feedback && (
        <div className="pt-2 border-t border-[var(--border)]">
          <p className="text-xs font-semibold text-[var(--muted)] mb-0.5">Feedback</p>
          <p className="text-sm text-[var(--text)]">{submission.feedback}</p>
        </div>
      )}
    </div>
  );
}

function SubmissionsList({ submissions, assignment, onGrade }) {
  return (
    <div className="mt-4 space-y-2">
      {submissions.length === 0 ? (
        <p className="text-xs text-[var(--muted)] italic">No submissions yet</p>
      ) : (
        submissions.map(s => (
          <div key={s.id}
            className="bg-[var(--bg)] rounded-lg px-4 py-3 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-[var(--muted)]">
                {s.student?.name} · {new Date(s.submittedAt).toLocaleString()}
                {s.status === "late" && <span className="ml-2 text-red-500">⏰ Late</span>}
                {s.status === "graded" && (
                  <span className={`ml-2 px-2 py-0.5 rounded text-xs font-bold ${scoreCls((s.score / assignment.maxScore) * 100)}`}>
                    {s.score}/{assignment.maxScore}
                  </span>
                )}
              </p>
              <button
                onClick={() => onGrade(s.id, s.score, s.feedback)}
                className="px-2 py-1 text-xs bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded border-none cursor-pointer font-semibold">
                Grade
              </button>
            </div>
            <p className="text-sm text-[var(--text)] leading-relaxed">{s.content}</p>
            {s.feedback && <p className="text-xs text-[var(--muted)] mt-1 italic">"{s.feedback}"</p>}
          </div>
        ))
      )}
    </div>
  );
}

export default AssignmentCard;