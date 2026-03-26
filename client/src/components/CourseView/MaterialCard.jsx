import VideoEmbed from "./VideoEmbed";

const typeLabel = (type) => {
  switch (type) {
    case "video": return "▶ Video";
    case "document": return "📄 Doc";
    case "link": return "🔗 Link";
    case "image": return "🖼 Image";
    default: return "📝 Other";
  }
};

const typeCls = (type) => {
  switch (type) {
    case "video": return "bg-red-100 text-red-600";
    case "document": return "bg-amber-100 text-amber-700";
    case "link": return "bg-blue-100 text-blue-600";
    case "image": return "bg-purple-100 text-purple-600";
    default: return "bg-emerald-100 text-emerald-700";
  }
};

function MaterialCard({ material, isTeacher, isDone, onToggleComplete, onDelete }) {
  return (
    <div className={`bg-[var(--surface)] rounded-xl p-5 border transition-colors ${
      isDone ? "border-emerald-300/60" : "border-[var(--border)]"
    } shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-[var(--text)]">{material.title}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeCls(material.type)}`}>
              {typeLabel(material.type)}
            </span>
            {isDone && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                ✓ Done
              </span>
            )}
          </div>
          {material.description && <p className="text-xs text-[var(--muted)] mb-1">{material.description}</p>}
          <p className="text-xs text-[var(--muted)] mb-1">
            {new Date(material.createdAt).toLocaleDateString()}
          </p>
          {material.fileUrl && material.type === "video" && <VideoEmbed url={material.fileUrl} />}
          {material.fileUrl && material.type !== "video" && (
            <a href={material.fileUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[var(--accent)] text-sm font-medium mt-1 hover:underline">
              📎 Open {material.type}
            </a>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isTeacher && (
            <button
              onClick={() => onToggleComplete(material.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-colors ${
                isDone
                  ? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
                  : "bg-[var(--bg)] hover:bg-emerald-50 text-[var(--muted)] hover:text-emerald-600 border border-[var(--border)]"
              }`}>
              {isDone ? "✓ Done" : "Mark Done"}
            </button>
          )}
          {isTeacher && (
            <button onClick={() => onDelete(material.id)}
              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold border-none cursor-pointer">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default MaterialCard;