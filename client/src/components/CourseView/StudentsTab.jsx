function StudentsTab({ students }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[var(--text)]">Enrolled Students</h2>
        <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full text-xs font-bold">
          {students.length} enrolled
        </span>
      </div>
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="text-center py-10 text-[var(--muted)] text-sm">No students enrolled yet</div>
        ) : (
          students.map((s, i) => (
            <div key={s.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${i < students.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 flex items-center justify-center text-[var(--accent-contrast)] text-sm font-bold flex-shrink-0">
                {s.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{s.name}</p>
                <p className="text-xs text-[var(--muted)]">{s.email}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default StudentsTab;
