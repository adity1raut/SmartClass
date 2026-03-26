const FEATURES = [
  "Manage courses, assignments, and quizzes seamlessly",
  "Real-time feedback and progress tracking",
  "Stay informed with alerts and reminders",
  "Built for teachers and students alike",
];

function FeatureList() {
  return (
    <div className="rounded-2xl bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] border border-[var(--border)] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="px-5 py-4 border-b border-[var(--border)]">
        <p className="text-sm font-semibold text-[var(--text)]">Why SmartClass?</p>
      </div>
      {FEATURES.map((f, i) => (
        <div
          key={f}
          className="flex items-start gap-3 px-5 py-3.5 border-b border-[var(--border)]/50 last:border-0 hover:bg-[var(--accent)]/6 transition-colors animate-in fade-in slide-in-from-left-8 duration-500"
          style={{ animationDelay: `${120 + i * 60}ms` }}
        >
          <span className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0 bg-[var(--accent)]" />
          <span className="text-sm text-[var(--muted)]">{f}</span>
        </div>
      ))}
    </div>
  );
}

export default FeatureList;