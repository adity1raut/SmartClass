import MaterialCard from "./MaterialCard";

function MaterialsTab({ materials, isTeacher, completedMats, onToggleComplete, onDelete, onAddClick }) {
  const doneCount = completedMats?.size ?? 0;

  return (
    <div>
      {isTeacher && (
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-5 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
          >
            <span className="text-lg font-light leading-none">+</span> Add Material
          </button>
        </div>
      )}

      {!isTeacher && materials.length > 0 && (
        <div className="flex items-center gap-3 mb-5 px-4 py-3 glass rounded-2xl border border-[var(--border)]/15">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-sm">📊</div>
          <div className="flex-1">
            <p className="text-xs font-bold text-[var(--text)]">{doneCount} of {materials.length} completed</p>
            <div className="mt-1 h-1.5 bg-[var(--border)]/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${materials.length ? Math.round((doneCount / materials.length) * 100) : 0}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-black text-emerald-400">
            {materials.length ? Math.round((doneCount / materials.length) * 100) : 0}%
          </span>
        </div>
      )}

      {materials.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-[var(--border)]/15">
          <div className="text-5xl mb-4">📄</div>
          <p className="text-base font-bold text-[var(--text)] mb-1">No materials yet</p>
          <p className="text-sm text-[var(--muted)]">
            {isTeacher ? "Add your first material to get started." : "Your teacher hasn't added materials yet."}
          </p>
          {isTeacher && (
            <button
              onClick={onAddClick}
              className="mt-5 px-6 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
            >
              + Add First Material
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m, i) => (
            <div
              key={m.id}
              className="animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <MaterialCard
                material={m}
                isTeacher={isTeacher}
                isDone={completedMats.has(m.id)}
                onToggleComplete={onToggleComplete}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MaterialsTab;
