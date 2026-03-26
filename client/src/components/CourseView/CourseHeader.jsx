function CourseHeader({
  course,
  materials,
  assignments,
  quizzes,
  liveClasses,
  isTeacher,
  matProgress,
}) {
  const stats = [
    {
      icon: "📄",
      val: materials.length,
      label: "Materials",
      color: "from-blue-400 to-indigo-500",
    },
    {
      icon: "📋",
      val: assignments.length,
      label: "Assignments",
      color: "from-amber-400 to-orange-500",
    },
    {
      icon: "🧠",
      val: quizzes.length,
      label: "Quizzes",
      color: "from-pink-400 to-rose-500",
    },
    {
      icon: "📹",
      val: liveClasses.length,
      label: "Live",
      color: "from-red-400 to-red-600",
    },
    {
      icon: "👨‍🎓",
      val: course.enrollmentCount ?? 0,
      label: "Students",
      color: "from-emerald-400 to-teal-500",
    },
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden mb-6 animate-[slide-down_0.6s_cubic-bezier(0.16,1,0.3,1)_both] shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4)]">
      {/* Main gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] via-violet-600 to-pink-600" />

      {/* Animated orbs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl animate-float pointer-events-none" />
      <div
        className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-pink-400/20 blur-2xl animate-float pointer-events-none"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full bg-violet-300/15 blur-xl animate-float pointer-events-none"
        style={{ animationDelay: "4s" }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative p-7 sm:p-8">
        {/* Top row: subject badge */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex-1 min-w-0">
            {/* Breadcrumb-like label */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm backdrop-blur-sm">
                📚
              </div>
              <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
                Course
              </span>
              {course.subject && (
                <>
                  <span className="text-white/30 text-xs">›</span>
                  <span className="text-white/70 text-xs font-bold uppercase tracking-widest">
                    {course.subject}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight leading-tight drop-shadow-sm">
              {course.title}
            </h1>

            <p className="text-sm text-white/80 font-semibold flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs backdrop-blur-sm">
                👨‍🏫
              </span>
              {course.teacher?.name}
            </p>

            {course.description && (
              <p className="text-sm text-white/60 leading-relaxed mt-3 max-w-2xl line-clamp-2">
                {course.description}
              </p>
            )}
          </div>

          {course.subject && (
            <div className="shrink-0 hidden sm:block">
              <div className="px-4 py-2.5 bg-white/15 rounded-2xl border border-white/20 backdrop-blur-sm text-center">
                <p className="text-white font-black text-sm tracking-wide">
                  {course.subject}
                </p>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-wider mt-0.5">
                  Subject
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2 mb-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2.5 px-4 py-2.5 bg-white/10 hover:bg-white/18 rounded-2xl
                         border border-white/12 backdrop-blur-sm transition-all duration-300 cursor-default group"
            >
              <div
                className={`w-7 h-7 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-sm
                              shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {s.icon}
              </div>
              <div>
                <p className="text-white font-black text-base leading-none">
                  {s.val}
                </p>
                <p className="text-white/60 text-[9px] font-bold uppercase tracking-wider leading-none mt-0.5">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Student progress */}
        {!isTeacher && materials.length > 0 && (
          <div className="mt-1">
            <div className="flex items-center justify-between text-xs font-bold text-white/80 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
                Your Progress
              </span>
              <span className="text-white font-black text-sm">
                {matProgress}%
              </span>
            </div>
            <div className="relative h-3 bg-white/15 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/90 to-white rounded-full
                           transition-all duration-700 ease-out shadow-[0_0_16px_rgba(255,255,255,0.5)]"
                style={{ width: `${matProgress}%` }}
              />
              {/* shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
            </div>
            <p className="text-white/50 text-[10px] font-semibold mt-1.5">
              Keep going — you're doing great!
            </p>
          </div>
        )}

        {/* Teacher badge */}
        {isTeacher && (
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/12 rounded-xl border border-white/15 text-white/80 text-xs font-bold backdrop-blur-sm">
              <span>🎓</span> Teaching Mode
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/12 rounded-xl border border-white/15 text-white/80 text-xs font-bold backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Course
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseHeader;
