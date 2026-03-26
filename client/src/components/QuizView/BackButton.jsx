function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full py-3 bg-[var(--bg)] hover:bg-[var(--border)]/50 text-[var(--text)] rounded-xl text-base font-semibold border border-[var(--border)] cursor-pointer transition-colors"
    >
      ← Back to Course
    </button>
  );
}

export default BackButton;