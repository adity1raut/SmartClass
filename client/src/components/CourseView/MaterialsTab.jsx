import MaterialCard from "./MaterialCard";

function MaterialsTab({ materials, isTeacher, completedMats, onToggleComplete, onDelete, onAddClick }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[var(--text)]">Course Materials</h2>
        {isTeacher && (
          <button onClick={onAddClick}
            className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors">
            + Add Material
          </button>
        )}
      </div>
      {materials.length === 0 ? (
        <div className="text-center py-14 text-[var(--muted)] text-sm">
          No materials yet{isTeacher ? ". Add your first one!" : "."}
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map(m => (
            <MaterialCard
              key={m.id}
              material={m}
              isTeacher={isTeacher}
              isDone={completedMats.has(m.id)}
              onToggleComplete={onToggleComplete}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default MaterialsTab;