const statusBadge = (status) => {
  switch (status) {
    case "live": return "bg-red-100 text-red-600";
    case "ended": return "bg-gray-100 text-gray-500";
    default: return "bg-blue-100 text-blue-600";
  }
};

function LiveClassCard({ liveClass, isTeacher, onStatusChange, onDelete, onJoin }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl p-5 border border-[var(--border)] shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-semibold text-[var(--text)]">{liveClass.title}</p>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusBadge(liveClass.status)}`}>
              {liveClass.status === "live" ? "🔴 LIVE" : liveClass.status === "ended" ? "⬛ Ended" : "🗓 Scheduled"}
            </span>
          </div>
          {liveClass.description && (
            <p className="text-xs text-[var(--muted)] mb-1">{liveClass.description}</p>
          )}
          <p className="text-xs text-[var(--muted)]">
            📅 {new Date(liveClass.scheduledAt).toLocaleString()}
            {liveClass.attendeeCount > 0 && ` · 👥 ${liveClass.attendeeCount} attended`}
          </p>
          {liveClass.meetingLink && liveClass.status !== "ended" && (
            <a href={liveClass.meetingLink} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--accent)] text-xs font-semibold mt-1.5 hover:underline">
              🔗 Join Meeting
            </a>
          )}
          {liveClass.recordingUrl && (
            <a href={liveClass.recordingUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-600 text-xs font-semibold mt-1.5 ml-3 hover:underline">
              ▶ Recording
            </a>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isTeacher ? (
            <>
              {liveClass.status === "scheduled" && (
                <button onClick={() => onStatusChange(liveClass.id, "live")}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-xs font-semibold border-none cursor-pointer">
                  Start
                </button>
              )}
              {liveClass.status === "live" && (
                <button onClick={() => onStatusChange(liveClass.id, "ended")}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-semibold border-none cursor-pointer">
                  End
                </button>
              )}
              <button onClick={() => onDelete(liveClass.id)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold border-none cursor-pointer">
                Delete
              </button>
            </>
          ) : (
            liveClass.status === "live" && (
              <button
                onClick={() => onJoin(liveClass.id, liveClass.meetingLink)}
                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold border-none cursor-pointer">
                🔴 Join Now
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveClassCard;