function QuizHeader({ quiz, answered, total }) {
  return (
    <div className="mb-7">
      <h1 className="text-2xl font-bold text-[var(--text)] mb-1">{quiz.title}</h1>
      {quiz.description && (
        <p className="text-sm text-[var(--muted)] mb-1">{quiz.description}</p>
      )}
      <p className="text-sm text-[var(--muted)]">
        {total} questions · {answered} answered
        {quiz.timeLimit > 0 && ` · ${quiz.timeLimit} min`}
      </p>
    </div>
  );
}

export default QuizHeader;