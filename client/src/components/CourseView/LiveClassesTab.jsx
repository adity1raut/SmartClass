import LiveClassCard from "./LiveClassCard";

function SectionLabel({ dot, label, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
        <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
          {label}
        </h3>
      </div>
      <span className="text-xs font-medium text-[var(--muted)] bg-[var(--card)] px-2.5 py-0.5 rounded-lg">
        {count}
      </span>
    </div>
  );
}

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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center text-lg shadow-sm">
            📹
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight">
              Live Classes
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              {liveClasses.length}{" "}
              {liveClasses.length === 1 ? "session" : "sessions"}
              {liveNow.length > 0 && (
                <span className="ml-2 text-red-500 font-semibold">
                  • {liveNow.length} live
                </span>
              )}
            </p>
          </div>
        </div>

        {isTeacher && (
          <button
            onClick={onAddClick}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-[var(--accent)] text-white
              hover:opacity-90 transition-all duration-200
              active:scale-95 shadow-md"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            Schedule Class
          </button>
        )}
      </div>

      {/* Empty State */}
      {liveClasses.length === 0 ? (
<<<<<<< HEAD
        <div className="text-center py-16 rounded-2xl border border-[var(--border)]/20 bg-[var(--card)] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
=======
        <div className="text-center py-20 bg-[var(--surface)] rounded-2xl border border-[var(--border)]">
          <div
            className="w-16 h-16 rounded-3xl bg-red-500/10 border border-red-500/15 flex items-center justify-center text-3xl mx-auto mb-5
                          shadow-[0_8px_24px_-8px_rgba(239,68,68,0.15)]"
          >
>>>>>>> 42795c9a6a2ed72e942e6619110abc54bb76c281
            📹
          </div>
          <p className="text-base font-semibold text-[var(--text)]">
            No live classes yet
          </p>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-xs mx-auto">
            {isTeacher
              ? "Start by scheduling your first session."
              : "No sessions available at the moment."}
          </p>

          {isTeacher && (
            <button
              onClick={onAddClick}
              className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold
                bg-[var(--accent)] text-white
                hover:opacity-90 transition active:scale-95"
            >
              + Schedule Class
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Live */}
          {liveNow.length > 0 && (
            <section>
              <SectionLabel
                dot="bg-red-500 animate-pulse"
                label="Live Now"
                count={liveNow.length}
              />
              <div className="grid gap-4">
                {liveNow.map((lc, i) => (
                  <div
                    key={lc.id}
                    className="animate-[fadeInUp_0.4s_ease_both]"
                    style={{ animationDelay: `${i * 60}ms` }}
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

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <SectionLabel
                dot="bg-blue-400"
                label="Upcoming"
                count={upcoming.length}
              />
              <div className="grid gap-4">
                {upcoming.map((lc, i) => (
                  <div
                    key={lc.id}
                    className="animate-[fadeInUp_0.4s_ease_both]"
                    style={{ animationDelay: `${i * 60}ms` }}
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

          {/* Past */}
          {ended.length > 0 && (
            <section>
              <SectionLabel
                dot="bg-[var(--muted)]/40"
                label="Past Sessions"
                count={ended.length}
              />
              <div className="grid gap-4">
                {ended.map((lc, i) => (
                  <div
                    key={lc.id}
                    className="animate-[fadeInUp_0.4s_ease_both]"
                    style={{ animationDelay: `${i * 60}ms` }}
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
