function RoleSelector({ role, setRole }) {
  const roles = [
    { value: "student", icon: "📚", label: "Student" },
    { value: "teacher", icon: "🏫", label: "Teacher" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-6">
      {roles.map(({ value, icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setRole(value)}
          className={`py-3 rounded-xl border text-sm font-semibold flex flex-col items-center gap-1 cursor-pointer transition-all outline-none active:scale-95 ${
            role === value
              ? "sc-role-active"
              : "bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)]/70"
          }`}
        >
          <span style={{ fontSize: 20 }}>{icon}</span>
          {label}
        </button>
      ))}
    </div>
  );
}

export default RoleSelector;