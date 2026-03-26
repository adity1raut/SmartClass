import VideoEmbed from "./VideoEmbed";

const TYPE_META = {
  video: {
    icon: "▶",
    label: "Video",
    bg: "from-red-500/20 to-red-600/10",
    text: "text-red-400",
    border: "border-red-500/20",
  },
  document: {
    icon: "📄",
    label: "Document",
    bg: "from-amber-500/20 to-amber-600/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
  },
  link: {
    icon: "🔗",
    label: "Link",
    bg: "from-blue-500/20 to-blue-600/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
  },
  image: {
    icon: "🖼",
    label: "Image",
    bg: "from-purple-500/20 to-purple-600/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
  },
};
const defaultMeta = {
  icon: "📝",
  label: "Other",
  bg: "from-emerald-500/20 to-emerald-600/10",
  text: "text-emerald-400",
  border: "border-emerald-500/20",
};

function MaterialCard({
  material,
  isTeacher,
  isDone,
  onToggleComplete,
  onDelete,
}) {
  const meta = TYPE_META[material.type] || defaultMeta;

  return (
    <div
      className={`group sc-card-premium glass rounded-2xl p-5 border transition-all duration-300
                     ${
                       isDone
                         ? "border-emerald-500/30 shadow-[0_0_20px_-4px_rgba(16,185,129,0.15)]"
                         : "border-[var(--border)]/20 hover:border-[var(--accent)]/25"
                     }`}
    >
      <div className="flex items-start gap-4">
        {/* Type icon */}
        <div
          className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${meta.bg} border ${meta.border}
                         flex items-center justify-center text-xl shrink-0
                         group-hover:scale-105 transition-transform duration-300`}
        >
          {meta.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[var(--text)]">
                {material.title}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider
                               bg-gradient-to-br ${meta.bg} ${meta.text} border ${meta.border}`}
              >
                {meta.label}
              </span>
              {isDone && (
                <span
                  className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider
                                 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                >
                  ✓ Completed
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!isTeacher && (
                <button
                  onClick={() => onToggleComplete(material.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all duration-200 active:scale-95
                               ${
                                 isDone
                                   ? "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border-emerald-500/25"
                                   : "glass hover:bg-[var(--accent)]/10 text-[var(--muted)] hover:text-[var(--accent)] border-[var(--border)]/30 hover:border-[var(--accent)]/30"
                               }`}
                >
                  {isDone ? "✓ Done" : "Mark Done"}
                </button>
              )}
              {isTeacher && (
                <button
                  onClick={() => onDelete(material.id)}
                  className="px-3 py-1.5 bg-red-500/8 hover:bg-red-500/18 text-red-400 rounded-xl text-xs font-bold
                             border border-red-500/20 cursor-pointer transition-all duration-200 active:scale-95"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {material.description && (
            <p className="text-xs text-[var(--muted)] mb-2 leading-relaxed">
              {material.description}
            </p>
          )}

          <p className="text-[10px] text-[var(--muted)]/60 font-semibold mb-2">
            Added {new Date(material.createdAt).toLocaleDateString()}
          </p>

          {material.fileUrl && material.type === "video" && (
            <div className="mt-3 rounded-xl overflow-hidden">
              <VideoEmbed url={material.fileUrl} />
            </div>
          )}
          {material.fileUrl && material.type !== "video" && (
            <a
              href={material.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-xs font-bold mt-1 hover:underline ${meta.text}`}
            >
              {meta.icon} Open {meta.label}
            </a>
          )}
        </div>
      </div>

      {/* Done overlay line */}
      {isDone && (
        <div className="mt-3 pt-3 border-t border-emerald-500/15 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            Material completed
          </span>
        </div>
      )}
    </div>
  );
}

export default MaterialCard;
