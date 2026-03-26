import { useNavigate } from "react-router-dom";

function QuizzesTab({ quizzes, isTeacher, onDelete, onAddClick }) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[var(--text)]">Quizzes</h2>
        {isTeacher && (
          <button onClick={onAddClick}
            className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors">
            + Create Quiz
          </button>
        )}
      </div>
      {quizzes.length === 0 ? (
        <div className="text-center py-14 text-[var(--muted)] text-sm">
          No quizzes yet{isTeacher ? ". Create one!" : "."}
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map(q => (
            <div key={q.id}
              className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)] shadow-sm flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--text)] mb-1">{q.title}</p>
                <div className="flex flex-wrap gap-3 text-xs text-[var(--muted)]">
                  <span>❓ {q.questionCount} questions</span>
                  <span>⭐ {q.totalPoints} pts</span>
                  {q.timeLimit > 0 && <span>⏱ {q.timeLimit} min</span>}
                  {q.dueDate && <span>📅 Due {new Date(q.dueDate).toLocaleDateString()}</span>}
                  {!q.isActive && <span className="text-red-500">Inactive</span>}
                </div>
                {q.description && (
                  <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{q.description}</p>
                )}
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!isTeacher && (
                  <button
                    onClick={() => navigate(`/quiz/${q.id}`)}
                    className="px-4 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg text-xs font-semibold border-none cursor-pointer">
                    Take Quiz →
                  </button>
                )}
                {isTeacher && (
                  <>
                    <button
                      onClick={() => navigate(`/quiz/${q.id}/results`)}
                      className="px-3 py-1.5 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg text-xs font-semibold border-none cursor-pointer">
                      Results
                    </button>
                    <button onClick={() => onDelete(q.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold border-none cursor-pointer">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizzesTab;