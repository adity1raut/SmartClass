function ResultCard({ result, emoji, scoreCls }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl p-10 text-center border border-[var(--border)] shadow-sm mb-6">
      <div className="text-5xl mb-4">{emoji}</div>
      <h2 className="text-xl font-bold text-[var(--text)] mb-4">Quiz Complete!</h2>
      <div className={`text-5xl font-extrabold mb-2 ${scoreCls}`}>
        {result.percentage}%
      </div>
      <p className="text-sm text-[var(--muted)]">
        {result.score} / {result.totalPoints} pts
      </p>
    </div>
  );
}

export default ResultCard;