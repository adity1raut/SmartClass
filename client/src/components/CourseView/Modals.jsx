const inputCls = "w-full px-3.5 py-2.5 border border-[var(--border)] rounded-lg text-sm outline-none focus:border-[var(--accent)] transition-colors bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]/70";
const textareaCls = "w-full px-3.5 py-2.5 border border-[var(--border)] rounded-lg text-sm outline-none resize-y focus:border-[var(--accent)] transition-colors bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)]/70";

export const MATERIAL_TYPES = [
  { value: "video", label: "Video (YouTube URL)" },
  { value: "link", label: "Link / URL" },
  { value: "document", label: "Document" },
  { value: "image", label: "Image" },
  { value: "other", label: "Other" },
];

export const modalOverlay = (onClose, children) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5"
    onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-7 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl text-[var(--text)]">
      {children}
    </div>
  </div>
);

export { inputCls, textareaCls };