import { useNavigate } from "react-router-dom";

function QuizzesTab({ quizzes, isTeacher, onDelete, onAddClick }) {
  const navigate = useNavigate();

  return (
    <div>
      {isTeacher && (
        <div className="flex justify-end mb-5">
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-5 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
          >
            <span className="text-lg font-light leading-none">+</span> Create
            Quiz
          </button>
        </div>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-[var(--border)]/15">
          <div className="text-5xl mb-4">🧠</div>
          <p className="text-base font-bold text-[var(--text)] mb-1">
            No quizzes yet
          </p>
          <p className="text-sm text-[var(--muted)]">
            {isTeacher
              ? "Create a quiz to test your students."
              : "No quizzes have been posted yet."}
          </p>
          {isTeacher && (
            <button
              onClick={onAddClick}
              className="mt-5 px-6 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
            >
              + Create Quiz
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {quizzes.map((q, i) => (
            <div
              key={q.id}
              className="group sc-card-premium glass rounded-2xl border border-[var(--border)]/20 hover:border-[var(--accent)]/25
                         overflow-hidden transition-all duration-300 animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              {/* Top accent */}
              <div className="h-1 w-full bg-gradient-to-r from-pink-500 to-rose-500" />

              <div className="p-5 flex items-start gap-4">
                {/* Icon */}
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/20
                                flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-300"
                >
                  🧠
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-sm font-bold text-[var(--text)] mb-1">
                        {q.title}
                      </p>
                      {q.description && (
                        <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">
                          {q.description}
                        </p>
                      )}
                    </div>
                    {!q.isActive && (
                      <span className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-black bg-red-500/12 text-red-400 border border-red-500/20 uppercase tracking-wider">
                        Inactive
                      </span>
                    )}
                  </div>

                  {/* Stats pills */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-pink-500/10 text-pink-400 border border-pink-500/15">
                      ❓ {q.questionCount} questions
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/15">
                      ⭐ {q.totalPoints} pts
                    </span>
                    {q.timeLimit > 0 && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/15">
                        ⏱ {q.timeLimit} min
                      </span>
                    )}
                    {q.dueDate && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--border)]/15 text-[var(--muted)] border border-[var(--border)]/20">
                        📅 Due {new Date(q.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isTeacher && (
                      <button
                        onClick={() => navigate(`/quiz/${q.id}`)}
                        className="flex items-center gap-1.5 px-4 py-2 sc-btn-glow rounded-xl text-xs font-bold cursor-pointer active:scale-95"
                      >
                        Take Quiz →
                      </button>
                    )}
                    {isTeacher && (
                      <>
                        <button
                          onClick={() => navigate(`/quiz/${q.id}/results`)}
                          className="px-4 py-2 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl text-xs font-bold border border-[var(--accent)]/15 cursor-pointer transition-all duration-200 active:scale-95"
                        >
                          View Results
                        </button>
                        <button
                          onClick={() => onDelete(q.id)}
                          className="px-4 py-2 bg-red-500/8 hover:bg-red-500/18 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 cursor-pointer transition-all duration-200 active:scale-95"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizzesTab;
