import AssignmentCard from "./AssignmentCard";

function AssignmentsTab({
  assignments,
  isTeacher,
  mySubmissions,
  expandedSubs,
  submissionText,
  onSubmit,
  onToggleSubs,
  onDelete,
  onGrade,
  onAddClick,
}) {
  return (
    <div>
      {isTeacher && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-[var(--text)]">Assignments</h2>
          <button onClick={onAddClick}
            className="px-4 py-2 bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] rounded-lg text-sm font-semibold border-none cursor-pointer transition-colors">
            + Add Assignment
          </button>
        </div>
      )}
      {assignments.length === 0 ? (
        <div className="text-center py-14 text-[var(--muted)] text-sm">
          No assignments yet{isTeacher ? ". Create one!" : "."}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map(a => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              isTeacher={isTeacher}
              mySubmission={mySubmissions[a.id]}
              submissions={expandedSubs[a.id]}
              submissionText={submissionText[a.id]}
              onSubmit={(aid, text, isUpdate) => 
                isUpdate 
                  ? onSubmit(aid, text) 
                  : onSubmit(aid, text, false)
              }
              onToggleSubs={onToggleSubs}
              onDelete={onDelete}
              onGrade={onGrade}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AssignmentsTab;