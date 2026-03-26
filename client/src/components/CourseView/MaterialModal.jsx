import { inputCls, modalOverlay, MATERIAL_TYPES } from "./Modals";

function MaterialModal({ isOpen, form, saving, onSubmit, onClose, onChange }) {
  if (!isOpen) return null;

  return modalOverlay(onClose, <>
    <h3 className="text-lg font-bold text-[var(--text)] mb-5">Add Material</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Title *</label>
        <input className={inputCls} value={form.title}
          onChange={e => onChange({ ...form, title: e.target.value })}
          placeholder="Material title" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Description</label>
        <input className={inputCls} value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          placeholder="Brief description (optional)" />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Type</label>
        <select className={inputCls} value={form.type}
          onChange={e => onChange({ ...form, type: e.target.value })}>
          {MATERIAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
          {form.type === "video" ? "YouTube URL *" : "URL / Link"}
        </label>
        <input className={inputCls} value={form.fileUrl}
          onChange={e => onChange({ ...form, fileUrl: e.target.value })}
          placeholder={form.type === "video" ? "https://youtube.com/watch?v=..." : "https://..."}
          required={form.type === "video"} />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-5 py-2 bg-[var(--bg)] hover:bg-[var(--border)]/40 text-[var(--text)] rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-[var(--accent)] hover:opacity-90 disabled:opacity-60 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer">
          {saving ? "Adding..." : "Add Material"}
        </button>
      </div>
    </form>
  </>);
}

export default MaterialModal;