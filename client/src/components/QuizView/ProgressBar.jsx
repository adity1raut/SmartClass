function ProgressBar({ answered, total }) {
  const percentage = total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className="h-1.5 bg-[var(--border)] rounded-full mb-7 overflow-hidden">
      <div
        className="h-full bg-[var(--accent)] rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export default ProgressBar;