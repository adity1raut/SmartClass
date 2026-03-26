function SubmitButton({ allAnswered, answered, total, onSubmit, isLoading = false }) {
  return (
    <button
      onClick={onSubmit}
      disabled={!allAnswered || isLoading}
      className="w-full py-3.5 bg-[var(--accent)] hover:opacity-90 disabled:opacity-60 text-[var(--accent-contrast)] rounded-xl text-base font-semibold border-none cursor-pointer disabled:cursor-not-allowed transition-colors mt-2"
    >
      {isLoading
        ? "Submitting..."
        : allAnswered
          ? "Submit Quiz"
          : `Answer all questions to submit (${answered}/${total})`}
    </button>
  );
}

export default SubmitButton;