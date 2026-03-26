import ReviewQuestion from "./ReviewQuestion";

function ReviewSection({ quiz, result }) {
  return (
    <>
      <h3 className="text-base font-bold text-[var(--text)] mb-4">Review Answers</h3>
      {quiz.questions.map((question, questionIndex) => (
        <ReviewQuestion
          key={questionIndex}
          question={question}
          questionIndex={questionIndex}
          result={result}
        />
      ))}
    </>
  );
}

export default ReviewSection;