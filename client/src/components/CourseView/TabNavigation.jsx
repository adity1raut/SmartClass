function TabNavigation({ tabs, tab, setTab, tabCount, tabLabel }) {
  return (
    <div className="flex gap-1 border-b-2 border-[var(--border)] mb-6 overflow-x-auto">
      {tabs.map(t => (
        <button key={t} onClick={() => setTab(t)}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-0.5 transition-colors capitalize bg-transparent border-x-0 border-t-0 cursor-pointer whitespace-nowrap ${
            tab === t
              ? "text-[var(--accent)] border-b-[var(--accent)] font-semibold"
              : "text-[var(--muted)] border-b-transparent hover:text-[var(--accent)]"
          }`}>
          {tabLabel[t] || t} ({tabCount[t]})
        </button>
      ))}
    </div>
  );
}

export default TabNavigation;