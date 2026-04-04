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
  const isPlatform = liveClass.type === "platform";

  const statusMeta = isLive
    ? {
        label: "Live",
        color: "text-red-500",
        bg: "bg-red-500/10",
        border: "border-red-500/20",
        dot: "bg-red-500",
      }
    : isEnded
      ? {
          label: "Ended",
          color: "text-gray-400",
          bg: "bg-gray-500/10",
          border: "border-gray-500/20",
          dot: "bg-gray-400",
        }
      : {
          label: "Scheduled",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          dot: "bg-blue-500",
        };

  return (
    <div
<<<<<<< HEAD
      className="group rounded-2xl border border-[var(--border)]/15 bg-[var(--card)] backdrop-blur-xl 
                    shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Top Accent Bar */}
      <div
        className={`h-1 w-full ${
          isLive
            ? "bg-gradient-to-r from-red-500 to-red-600"
            : isScheduled
              ? "bg-gradient-to-r from-blue-500 to-indigo-500"
              : "bg-gradient-to-r from-gray-400 to-gray-500"
        }`}
      />

      <div className="p-6 flex gap-4">
=======
      className={`group bg-[var(--surface)] rounded-2xl border overflow-hidden transition-all duration-300
                   hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.10)] ${statusMeta.cardBorder}`}
    >
      <div className="p-5 sm:p-6 flex items-start gap-4">
>>>>>>> 42795c9a6a2ed72e942e6619110abc54bb76c281
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border shrink-0
          ${statusMeta.bg} ${statusMeta.border}`}
        >
          {isLive ? "📡" : isEnded ? "📼" : "📅"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title + badges */}
          <div className="flex items-center flex-wrap gap-2 mb-2">
            <h3 className="text-base font-semibold text-[var(--text)] leading-tight">
              {liveClass.title}
            </h3>

            <span
              className={`flex items-center gap-1 px-2 py-[2px] text-[10px] font-semibold rounded-md border
              ${statusMeta.bg} ${statusMeta.color} ${statusMeta.border}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot} ${
                  isLive ? "animate-pulse" : ""
                }`}
              />
              {statusMeta.label}
            </span>

            <span className="text-[10px] px-2 py-[2px] rounded-md bg-[var(--border)]/10 border border-[var(--border)]/15 text-[var(--muted)]">
              {isPlatform ? "Platform" : "External"}
            </span>
          </div>

          {/* Description */}
          {liveClass.description && (
            <p className="text-sm text-[var(--muted)] mb-3 line-clamp-2">
              {liveClass.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <span className="px-3 py-1 rounded-lg bg-[var(--border)]/10 border border-[var(--border)]/15 text-[var(--muted)]">
              📅{" "}
              {new Date(liveClass.scheduledAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}{" "}
              ·{" "}
              {new Date(liveClass.scheduledAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>

            {liveClass.attendeeCount > 0 && (
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                👥 {liveClass.attendeeCount}
              </span>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            {!isPlatform && liveClass.meetingLink && !isEnded && (
              <a
                href={liveClass.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                🔗 Meeting Link
              </a>
            )}

            {liveClass.recordingUrl && (
              <a
                href={liveClass.recordingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-500 hover:underline"
              >
                ▶ Recording
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
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                  >
                    Start
                  </button>
                )}

                {isLive && isPlatform && (
                  <button
                    onClick={() => onJoin(liveClass.id, null)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                  >
                    Enter
                  </button>
                )}

                {isLive && (
                  <button
                    onClick={() => onStatusChange(liveClass.id, "ended")}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--border)]/10 transition"
                  >
                    End
                  </button>
                )}

                <button
                  onClick={() => onDelete(liveClass.id)}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-red-500 hover:bg-red-500/10 transition"
                >
                  Delete
                </button>
              </>
            ) : (
              isLive && (
                <button
                  onClick={() =>
                    onJoin(
                      liveClass.id,
                      isPlatform ? null : liveClass.meetingLink,
                    )
                  }
                  className={`px-5 py-2 text-xs font-semibold rounded-lg text-white transition
                    ${
                      isPlatform
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                >
                  Join Live
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
