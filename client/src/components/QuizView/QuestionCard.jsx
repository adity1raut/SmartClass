function QuestionCard({ question, questionIndex, total, selected, onSelect, disabled = false }) {
  return (
    <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border)] shadow-sm mb-4">
      <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
        Question {questionIndex + 1} of {total}
        {question.points > 1 && (
          <span className="ml-2 px-2 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full normal-case">
            {question.points} pts
          </span>
        )}
      </p>
      <p className="text-base font-semibold text-[var(--text)] mb-5 leading-relaxed">
        {question.question}
      </p>
      <div className="space-y-3">
        {question.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          return (
            <OptionButton
              key={optionIndex}
              option={option}
              optionIndex={optionIndex}
              isSelected={isSelected}
              onClick={() => !disabled && onSelect(optionIndex)}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
}

function OptionButton({ option, optionIndex, isSelected, onClick, disabled }) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 border-2 rounded-xl cursor-pointer transition-all select-none ${
        disabled ? "cursor-not-allowed opacity-75" : ""
      } ${
        isSelected
          ? "border-[var(--accent)] bg-[var(--accent)]/10"
          : "border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg)]"
      }`}
    >
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          isSelected
            ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
            : "bg-[var(--border)] text-[var(--muted)]"
        }`}
      >
        {String.fromCharCode(65 + optionIndex)}
      </span>
      <span className="text-sm text-[var(--text)]">{option}</span>
    </div>
  );
}

export default QuestionCard;