import AssignmentCard from "./AssignmentCard";

function AssignmentsTab({ assignments, isTeacher, mySubmissions, expandedSubs, submissionText, onSubmit, onToggleSubs, onDelete, onGrade, onAddClick }) {
  return (
    <div>
      {isTeacher && (
        <div className="flex justify-end mb-5">
          <button
            onClick={onAddClick}
            className="flex items-center gap-2 px-5 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95"
          >
            <span className="text-lg font-light leading-none">+</span> Add Assignment
          </button>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl border border-[var(--border)]/15">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-base font-bold text-[var(--text)] mb-1">No assignments yet</p>
          <p className="text-sm text-[var(--muted)]">
            {isTeacher ? "Create your first assignment for students." : "No assignments have been posted yet."}
          </p>
          {isTeacher && (
            <button onClick={onAddClick} className="mt-5 px-6 py-2.5 sc-btn-glow rounded-xl text-sm font-bold cursor-pointer active:scale-95">
              + Create Assignment
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((a, i) => (
            <div key={a.id} className="animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: `${i * 50}ms` }}>
              <AssignmentCard
                assignment={a}
                isTeacher={isTeacher}
                mySubmission={mySubmissions[a.id]}
                submissions={expandedSubs[a.id]}
                submissionText={submissionText[a.id]}
                onSubmit={(aid, text, isUpdate) => isUpdate ? onSubmit(aid, text) : onSubmit(aid, text, false)}
                onToggleSubs={onToggleSubs}
                onDelete={onDelete}
                onGrade={onGrade}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AssignmentsTab;
