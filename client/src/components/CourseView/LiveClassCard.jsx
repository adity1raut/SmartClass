function LiveClassCard({
  liveClass,
  isTeacher,
  onStatusChange,
  onDelete,
  onJoin,
}) {
  const isLive = liveClass.status === "live";
  const isEnded = liveClass.status === "ended";
  const isScheduled = liveClass.status === "scheduled";

  const statusMeta = isLive
    ? {
        label: "🔴 LIVE NOW",
        bg: "bg-red-500/15",
        text: "text-red-400",
        border: "border-red-500/30",
        glow: "shadow-[0_0_20px_-4px_rgba(239,68,68,0.35)]",
        bar: "from-red-500 to-red-600",
      }
    : isEnded
      ? {
          label: "⬛ Ended",
          bg: "bg-[var(--border)]/10",
          text: "text-[var(--muted)]",
          border: "border-[var(--border)]/20",
          glow: "",
          bar: "from-gray-500 to-gray-600",
        }
      : {
          label: "🗓 Scheduled",
          bg: "bg-blue-500/12",
          text: "text-blue-400",
          border: "border-blue-500/25",
          glow: "",
          bar: "from-blue-500 to-indigo-600",
        };

  return (
    <div
      className={`group sc-card-premium glass rounded-2xl border overflow-hidden transition-all duration-300
                     ${isLive ? "border-red-500/30 shadow-[0_0_24px_-6px_rgba(239,68,68,0.25)]" : "border-[var(--border)]/20 hover:border-[var(--accent)]/20"}`}
    >
      {/* Accent bar */}
      <div
        className={`h-1 w-full bg-gradient-to-r ${statusMeta.bar} ${isLive ? "animate-pulse" : ""}`}
      />

      <div className="p-5 flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0
                         ${statusMeta.bg} border ${statusMeta.border} ${statusMeta.glow}
                         ${isLive ? "animate-pulse" : "group-hover:scale-105 transition-transform duration-300"}`}
        >
          {isLive ? "📡" : isEnded ? "📼" : "📅"}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="text-sm font-bold text-[var(--text)]">
                  {liveClass.title}
                </p>
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border ${statusMeta.bg} ${statusMeta.text} ${statusMeta.border}`}
                >
                  {statusMeta.label}
                </span>
              </div>
              {liveClass.description && (
                <p className="text-xs text-[var(--muted)] mb-2 leading-relaxed">
                  {liveClass.description}
                </p>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--border)]/12 text-[var(--muted)] border border-[var(--border)]/15">
              📅 {new Date(liveClass.scheduledAt).toLocaleDateString()} ·{" "}
              {new Date(liveClass.scheduledAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {liveClass.attendeeCount > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                👥 {liveClass.attendeeCount} attended
              </span>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {liveClass.meetingLink && !isEnded && (
              <a
                href={liveClass.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:underline"
              >
                🔗 Meeting Link
              </a>
            )}
            {liveClass.recordingUrl && (
              <a
                href={liveClass.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:underline"
              >
                ▶ Watch Recording
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {isTeacher ? (
              <>
                {isScheduled && (
                  <button
                    onClick={() => onStatusChange(liveClass.id, "live")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 rounded-xl text-xs font-bold border border-red-500/25 cursor-pointer transition-all duration-200 active:scale-95"
                  >
                    🔴 Start Live
                  </button>
                )}
                {isLive && (
                  <button
                    onClick={() => onStatusChange(liveClass.id, "ended")}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[var(--border)]/15 hover:bg-[var(--border)]/25 text-[var(--muted)] rounded-xl text-xs font-bold border border-[var(--border)]/20 cursor-pointer transition-all duration-200 active:scale-95"
                  >
                    ⬛ End Class
                  </button>
                )}
                <button
                  onClick={() => onDelete(liveClass.id)}
                  className="px-4 py-2 bg-red-500/8 hover:bg-red-500/18 text-red-400 rounded-xl text-xs font-bold border border-red-500/20 cursor-pointer transition-all duration-200 active:scale-95"
                >
                  Delete
                </button>
              </>
            ) : (
              isLive && (
                <button
                  onClick={() => onJoin(liveClass.id, liveClass.meetingLink)}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:shadow-[0_8px_20px_-4px_rgba(239,68,68,0.5)]
                             text-white rounded-xl text-xs font-black border-none cursor-pointer transition-all duration-300 active:scale-95 animate-pulse"
                >
                  🔴 Join Live Now
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveClassCard;
