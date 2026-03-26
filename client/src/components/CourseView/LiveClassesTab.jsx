import LiveClassCard from "./LiveClassCard";

function LiveClassesTab({
  liveClasses,
  isTeacher,
  onStatusChange,
  onDelete,
  onJoin,
  onAddClick,
}) {
  const liveNow = liveClasses.filter((lc) => lc.status === "live");
  const upcoming = liveClasses.filter((lc) => lc.status === "scheduled");
  const ended = liveClasses.filter((lc) => lc.status === "ended");

  return (
    <div>
      {isTeacher && (
        <div className="flex justify-end mb-5">
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-5 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
          >
            <span className="text-lg font-light leading-none">+</span> Schedule
            Class
          </button>
        </div>
      )}

      {liveClasses.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-[var(--border)]/15">
          <div className="text-5xl mb-4">📹</div>
          <p className="text-base font-bold text-[var(--text)] mb-1">
            No live classes yet
          </p>
          <p className="text-sm text-[var(--muted)]">
            {isTeacher
              ? "Schedule your first live session."
              : "No live classes have been scheduled yet."}
          </p>
          {isTeacher && (
            <button
              onClick={onAddClick}
              className="mt-5 px-6 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
            >
              + Schedule Class
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {liveNow.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-widest text-red-400">
                  Live Now
                </h3>
              </div>
              <div className="space-y-3">
                {liveNow.map((lc, i) => (
                  <div
                    key={lc.id}
                    className="animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <LiveClassCard
                      liveClass={lc}
                      isTeacher={isTeacher}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                      onJoin={onJoin}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">
                  Upcoming
                </h3>
              </div>
              <div className="space-y-3">
                {upcoming.map((lc, i) => (
                  <div
                    key={lc.id}
                    className="animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <LiveClassCard
                      liveClass={lc}
                      isTeacher={isTeacher}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                      onJoin={onJoin}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {ended.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[var(--muted)]/40" />
                <h3 className="text-xs font-black uppercase tracking-widest text-[var(--muted)]">
                  Past Sessions
                </h3>
              </div>
              <div className="space-y-3">
                {ended.map((lc, i) => (
                  <div
                    key={lc.id}
                    className="animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <LiveClassCard
                      liveClass={lc}
                      isTeacher={isTeacher}
                      onStatusChange={onStatusChange}
                      onDelete={onDelete}
                      onJoin={onJoin}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default LiveClassesTab;
