const STATS = [
  { value: "12k+", label: "Active learners" },
  { value: "400+", label: "Courses live" },
  { value: "98%", label: "Satisfaction" },
];

function StatsGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {STATS.map(({ value, label }, i) => (
        <div
          key={label}
          className="rounded-xl bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] border border-[var(--border)] px-4 py-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all animate-in fade-in slide-in-from-left-8 duration-500"
          style={{ animationDelay: `${240 + i * 80}ms` }}
        >
          <p className="sc-title text-2xl font-bold text-[var(--accent)]">{value}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;