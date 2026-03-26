function BrandHeader({ showLabel = true }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[0_10px_30px_-10px_var(--accent)] animate-bounce">
        🎓
      </div>
      <div>
        <h1 className="sc-title text-3xl font-bold text-[var(--text)]">SmartClass</h1>
        {showLabel && <p className="text-xs text-[var(--muted)] mt-0.5">Modern learning management</p>}
      </div>
    </div>
  );
}

export default BrandHeader;