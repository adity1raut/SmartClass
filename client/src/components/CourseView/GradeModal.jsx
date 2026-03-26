import { inputCls, textareaCls, modalOverlay } from "./Modals";

function GradeModal({ isOpen, gradeForm, onSubmit, onClose, onChange }) {
  if (!isOpen) return null;

  return modalOverlay(onClose, <>
    <h3 className="text-lg font-bold text-[var(--text)] mb-5">Grade Submission</h3>
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Score</label>
        <input type="number" className={inputCls} value={gradeForm.score}
          onChange={e => onChange({ ...gradeForm, score: e.target.value })}
          placeholder="e.g. 85" required />
      </div>
      <div>
        <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Feedback</label>
        <textarea className={`${textareaCls} min-h-[70px]`} value={gradeForm.feedback}
          onChange={e => onChange({ ...gradeForm, feedback: e.target.value })}
          placeholder="Optional feedback..." />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button"
          onClick={onClose}
          className="px-5 py-2 bg-[var(--bg)] hover:bg-[var(--border)]/40 text-[var(--text)] rounded-lg text-sm font-medium border border-[var(--border)] cursor-pointer transition-colors">
          Cancel
        </button>
        <button type="submit"
          className="px-5 py-2 bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer">
          Save Grade
        </button>
      </div>
    </form>
  </>);
}

export default GradeModal;