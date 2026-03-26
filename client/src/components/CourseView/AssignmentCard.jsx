const scorePct = (score, max) => Math.round((score / max) * 100);
const scoreColor = (pct) =>
  pct >= 70
    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25"
    : pct >= 40
      ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
      : "bg-red-500/15 text-red-400 border-red-500/25";

function AssignmentCard({
  assignment,
  isTeacher,
  mySubmission,
  submissions,
  submissionText,
  onSubmit,
  onToggleSubs,
  onDelete,
  onGrade,
}) {
  const isOverdue =
    assignment.dueDate && new Date(assignment.dueDate) < new Date();
  const hasSubmission = !!mySubmission;
  const isGraded = mySubmission?.status === "graded";

  return (
    <div className="group sc-card-premium glass rounded-2xl border border-[var(--border)]/20 hover:border-[var(--accent)]/20 transition-all duration-300 overflow-hidden">
      {/* Top accent bar based on status */}
      <div
        className={`h-1 w-full ${
          isOverdue && !hasSubmission
            ? "bg-gradient-to-r from-red-500 to-red-600"
            : hasSubmission
              ? "bg-gradient-to-r from-emerald-500 to-teal-500"
              : "bg-gradient-to-r from-amber-500 to-orange-500"
        }`}
      />

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0
                           ${
                             isOverdue && !hasSubmission
                               ? "bg-red-500/15 border border-red-500/20"
                               : hasSubmission
                                 ? "bg-emerald-500/15 border border-emerald-500/20"
                                 : "bg-amber-500/15 border border-amber-500/20"
                           }`}
          >
            {isOverdue && !hasSubmission ? "⚠️" : hasSubmission ? "✅" : "📋"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-bold text-[var(--text)] leading-snug">
                {assignment.title}
              </p>
              <div className="flex items-center gap-2 shrink-0">
                {/* Status badge */}
                {isTeacher ? (
                  <>
                    <button
                      onClick={() => onToggleSubs(assignment.id)}
                      className="px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl text-xs font-bold border border-[var(--accent)]/15 cursor-pointer transition-all duration-200 active:scale-95"
                    >
                      {submissions !== undefined ? "Hide" : "Submissions"}
                    </button>
                    <button
                      onClick={() => onDelete(assignment.id)}
                      className="px-3 py-1.5 bg-red-500/8 hover:bg-red-500/18 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 cursor-pointer transition-all duration-200 active:scale-95"
                    >
                      Delete
                    </button>
                  </>
                ) : isGraded ? (
                  <span
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border ${scoreColor(scorePct(mySubmission.score, assignment.maxScore))}`}
                  >
                    {mySubmission.score}/{assignment.maxScore} pts
                  </span>
                ) : hasSubmission ? (
                  <span className="px-3 py-1.5 bg-emerald-500/12 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/20">
                    ✓ Submitted
                  </span>
                ) : null}
              </div>
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap gap-2 mb-2">
              {assignment.dueDate && (
                <span
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border
                  ${
                    isOverdue
                      ? "bg-red-500/12 text-red-400 border-red-500/20"
                      : "bg-[var(--border)]/15 text-[var(--muted)] border-[var(--border)]/20"
                  }`}
                >
                  {isOverdue ? "⚠ Overdue" : "📅"}{" "}
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
              )}
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--border)]/15 text-[var(--muted)] border border-[var(--border)]/20">
                ⭐ {assignment.maxScore} pts max
              </span>
            </div>

            {assignment.description && (
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {assignment.description}
              </p>
            )}
          </div>
        </div>

        {/* Student: submission form */}
        {!isTeacher && !hasSubmission && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]/15">
            <p className="text-xs font-bold text-[var(--muted)] mb-2 uppercase tracking-wider">
              Your Answer
            </p>
            <textarea
              className="w-full px-4 py-3 glass border border-[var(--border)]/30 rounded-xl text-sm outline-none
                         resize-y focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10
                         transition-all duration-200 text-[var(--text)] placeholder:text-[var(--muted)]/40 min-h-[90px]"
              placeholder="Write your answer here..."
              value={submissionText || ""}
              onChange={(e) => onSubmit(assignment.id, e.target.value, true)}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => onSubmit(assignment.id, submissionText, false)}
                disabled={!submissionText?.trim()}
                className="px-5 py-2 sc-btn-glow disabled:opacity-40 rounded-xl text-xs font-bold cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Submit Answer →
              </button>
            </div>
          </div>
        )}

        {/* Student: submitted view */}
        {!isTeacher && hasSubmission && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]/15">
            <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-2">
              Your Submission
            </p>
            <div className="glass rounded-xl px-4 py-3 border border-[var(--border)]/15">
              <p className="text-sm text-[var(--text)] leading-relaxed">
                {mySubmission.content}
              </p>
              {mySubmission.feedback && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]/15">
                  <p className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider mb-1">
                    Teacher Feedback
                  </p>
                  <p className="text-sm text-[var(--text)] leading-relaxed italic">
                    "{mySubmission.feedback}"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Teacher: submissions list */}
        {isTeacher && submissions !== undefined && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]/15">
            {submissions.length === 0 ? (
              <p className="text-xs text-[var(--muted)] text-center py-4">
                No submissions yet.
              </p>
            ) : (
              <div className="space-y-2">
                {submissions.map((s) => {
                  const pct =
                    s.status === "graded"
                      ? scorePct(s.score, assignment.maxScore)
                      : null;
                  return (
                    <div
                      key={s.id}
                      className="glass rounded-xl px-4 py-3 border border-[var(--border)]/15"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent)]/25 to-[var(--accent)]/5 border border-[var(--accent)]/15 flex items-center justify-center text-xs font-black text-[var(--accent)]">
                            {s.student?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-[var(--text)]">
                              {s.student?.name}
                            </p>
                            <p className="text-[10px] text-[var(--muted)]">
                              {new Date(s.submittedAt).toLocaleString()}
                              {s.status === "late" && (
                                <span className="ml-2 text-red-400">
                                  ⏰ Late
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {pct !== null && (
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${scoreColor(pct)}`}
                            >
                              {s.score}/{assignment.maxScore}
                            </span>
                          )}
                          <button
                            onClick={() => onGrade(s.id, s.score, s.feedback)}
                            className="px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl text-[10px] font-bold border border-[var(--accent)]/15 cursor-pointer transition-all duration-200"
                          >
                            {pct !== null ? "Re-grade" : "Grade"}
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text)] leading-relaxed pl-9">
                        {s.content}
                      </p>
                      {s.feedback && (
                        <p className="text-[10px] text-[var(--muted)] mt-1 pl-9 italic">
                          "{s.feedback}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignmentCard;
