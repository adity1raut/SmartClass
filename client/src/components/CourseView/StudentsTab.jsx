const AVATAR_COLORS = [
  "from-violet-500/40 to-purple-500/20 text-violet-300 border-violet-500/20",
  "from-blue-500/40 to-indigo-500/20 text-blue-300 border-blue-500/20",
  "from-emerald-500/40 to-teal-500/20 text-emerald-300 border-emerald-500/20",
  "from-pink-500/40 to-rose-500/20 text-pink-300 border-pink-500/20",
  "from-amber-500/40 to-orange-500/20 text-amber-300 border-amber-500/20",
  "from-cyan-500/40 to-sky-500/20 text-cyan-300 border-cyan-500/20",
];

function StudentsTab({ students }) {
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-lg">
            👨‍🎓
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--text)]">
              Enrolled Students
            </p>
            <p className="text-[10px] text-[var(--muted)] font-semibold">
              {students.length} total enrolled
            </p>
          </div>
        </div>
        <span className="px-3 py-1.5 bg-emerald-500/12 text-emerald-400 rounded-xl text-xs font-black border border-emerald-500/20">
          {students.length} students
        </span>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-[var(--border)]/15">
          <div className="text-5xl mb-4">👨‍🎓</div>
          <p className="text-base font-bold text-[var(--text)] mb-1">
            No students enrolled yet
          </p>
          <p className="text-sm text-[var(--muted)]">
            Students will appear here once they enroll in this course.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {students.map((s, i) => {
            const colorClass = AVATAR_COLORS[i % AVATAR_COLORS.length];
            return (
              <div
                key={s.id}
                className="group glass sc-card-premium rounded-2xl p-4 border border-[var(--border)]/15 hover:border-[var(--accent)]/20
                           flex items-center gap-3 transition-all duration-300
                           animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${colorClass} border
                                 flex items-center justify-center text-sm font-black shrink-0
                                 group-hover:scale-105 transition-transform duration-300`}
                >
                  {s.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text)] truncate">
                    {s.name}
                  </p>
                  <p className="text-[10px] text-[var(--muted)] truncate font-medium">
                    {s.email}
                  </p>
                </div>

                <div
                  className="w-7 h-7 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center shrink-0
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <span className="text-xs text-emerald-400">✓</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {students.length > 0 && (
        <div className="mt-4 px-4 py-3 glass rounded-2xl border border-[var(--border)]/10 flex items-center gap-2">
          <span className="text-xs text-[var(--muted)] font-semibold">
            💡 {students.length} student{students.length !== 1 ? "s" : ""}{" "}
            enrolled in this course
          </span>
        </div>
      )}
    </div>
  );
}

export default StudentsTab;
