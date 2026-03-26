function CourseHeader({ course, materials, assignments, quizzes, liveClasses, isTeacher, matProgress }) {
  return (
    <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80 rounded-2xl p-7 text-[var(--accent-contrast)] mb-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold mb-1.5">{course.title}</h1>
          <p className="text-sm opacity-80 mb-1">👨‍🏫 {course.teacher?.name}</p>
          {course.description && (
            <p className="text-sm opacity-75 leading-relaxed">{course.description}</p>
          )}
        </div>
        {course.subject && (
          <span className="px-3.5 py-1.5 bg-white/20 rounded-full text-sm font-semibold whitespace-nowrap">
            {course.subject}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-4 mt-5 text-xs font-medium opacity-80">
        <span>📄 {materials.length} materials</span>
        <span>📋 {assignments.length} assignments</span>
        <span>🧠 {quizzes.length} quizzes</span>
        <span>📹 {liveClasses.length} live classes</span>
        <span>👨‍🎓 {course.enrollmentCount} students</span>
      </div>
      {!isTeacher && materials.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs opacity-80 mb-1.5">
            <span>Course Progress</span>
            <span>{matProgress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${matProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseHeader;