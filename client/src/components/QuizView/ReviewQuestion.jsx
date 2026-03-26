function ReviewQuestion({ question, questionIndex, result }) {
  const answer = result.answers?.find((a) => a.questionIndex === questionIndex);
  const selectedOption = answer?.selectedOption;
  const correctOption = question.correctOption;
  const isCorrect = selectedOption === correctOption;

  return (
    <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] shadow-sm mb-4">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
        Question {questionIndex + 1}
      </p>
      <p className="text-base font-semibold text-[var(--text)] mb-5 leading-relaxed">
        {question.question}
      </p>
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => {
          const isCorrectOption = correctOption === optionIndex;
          const isSelectedWrong = selectedOption === optionIndex && !isCorrect;

          return (
            <ReviewOptionButton
              key={optionIndex}
              option={option}
              optionIndex={optionIndex}
              isCorrectOption={isCorrectOption}
              isSelectedWrong={isSelectedWrong}
            />
          );
        })}
      </div>
      <p className={`text-xs font-semibold mt-3 ${isCorrect ? "text-emerald-600" : "text-red-500"}`}>
        {isCorrect
          ? "✓ Correct"
          : `✗ Wrong — Correct answer: ${question.options[correctOption]}`}
      </p>
    </div>
  );
}

function ReviewOptionButton({ option, optionIndex, isCorrectOption, isSelectedWrong }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl ${
        isCorrectOption
          ? "border-emerald-500 bg-emerald-50"
          : isSelectedWrong
            ? "border-red-400 bg-red-50"
            : "border-[var(--border)] bg-[var(--bg)]"
      }`}
    >
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isCorrectOption
            ? "bg-emerald-500 text-white"
            : isSelectedWrong
              ? "bg-red-400 text-white"
              : "bg-[var(--border)] text-[var(--muted)]"
        }`}
      >
        {String.fromCharCode(65 + optionIndex)}
      </span>
      <span className="text-sm text-[var(--text)]">{option}</span>
    </div>
  );
}

export default ReviewQuestion;