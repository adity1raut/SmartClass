import { inputCls, textareaCls, modalOverlay } from "./Modals";

function AssignmentModal({ isOpen, form, saving, onSubmit, onClose, onChange }) {
  if (!isOpen) return null;

  return modalOverlay(onClose, <>
    <h3 className="text-lg font-bold text-[var(--text)] mb-5">Create Assignment</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Title *</label>
        <input className={inputCls} value={form.title}
          onChange={e => onChange({ ...form, title: e.target.value })}
          placeholder="Assignment title" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Description</label>
        <textarea className={`${textareaCls} min-h-[70px]`} value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          placeholder="Instructions for students..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Due Date</label>
          <input type="date" className={inputCls} value={form.dueDate}
            onChange={e => onChange({ ...form, dueDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Max Score</label>
          <input type="number" className={inputCls} value={form.maxScore}
            onChange={e => onChange({ ...form, maxScore: e.target.value })} min={1} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-5 py-2 bg-[var(--bg)] hover:bg-[var(--border)]/40 text-[var(--text)] rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-[var(--accent)] hover:opacity-90 disabled:opacity-60 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer">
          {saving ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  </>);
}

export default AssignmentModal;