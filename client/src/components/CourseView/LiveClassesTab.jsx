import LiveClassCard from "./LiveClassCard";

function LiveClassesTab({ liveClasses, isTeacher, onStatusChange, onDelete, onJoin, onAddClick }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-[var(--text)]">Live Classes</h2>
        {isTeacher && (
          <button onClick={onAddClick}
            className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors">
            + Schedule Class
          </button>
        )}
      </div>
      {liveClasses.length === 0 ? (
        <div className="text-center py-14 text-[var(--muted)] text-sm">
          No live classes yet{isTeacher ? ". Schedule one!" : "."}
        </div>
      ) : (
        <div className="space-y-3">
          {liveClasses.map(lc => (
            <LiveClassCard
              key={lc.id}
              liveClass={lc}
              isTeacher={isTeacher}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onJoin={onJoin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default LiveClassesTab;