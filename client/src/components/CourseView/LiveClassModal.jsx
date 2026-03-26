import { inputCls, textareaCls, modalOverlay } from "./Modals";

function LiveClassModal({ isOpen, form, saving, onSubmit, onClose, onChange }) {
  if (!isOpen) return null;

  return modalOverlay(onClose, <>
    <h3 className="text-lg font-bold text-[var(--text)] mb-5">Schedule Live Class</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Title *</label>
        <input className={inputCls} value={form.title}
          onChange={e => onChange({ ...form, title: e.target.value })}
          placeholder="e.g. Chapter 3 Discussion" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Description</label>
        <textarea className={`${textareaCls} min-h-[60px]`} value={form.description}
          onChange={e => onChange({ ...form, description: e.target.value })}
          placeholder="What will be covered..." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Date & Time *</label>
          <input type="datetime-local" className={inputCls} value={form.scheduledAt}
            onChange={e => onChange({ ...form, scheduledAt: e.target.value })} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Meeting Link</label>
          <input className={inputCls} value={form.meetingLink}
            onChange={e => onChange({ ...form, meetingLink: e.target.value })}
            placeholder="https://meet.google.com/..." />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose}
          className="px-5 py-2 bg-[var(--bg)] hover:bg-[var(--border)]/40 text-[var(--text)] rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving}
          className="px-5 py-2 bg-[var(--accent)] hover:opacity-90 disabled:opacity-60 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer">
          {saving ? "Scheduling..." : "Schedule"}
        </button>
      </div>
    </form>
  </>);
}

export default LiveClassModal;