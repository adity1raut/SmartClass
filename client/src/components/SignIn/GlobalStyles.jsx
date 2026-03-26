function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap');
      .sc-title { font-family: 'Syne', sans-serif; letter-spacing: -0.02em; }
      .sc-card { position: relative; isolation: isolate; backdrop-filter: blur(8px); }
      .sc-card::before { content: ""; position: absolute; inset: -1px; border-radius: 1rem; background: conic-gradient(from 0deg, transparent, color-mix(in srgb, var(--accent) 45%, transparent), transparent 35%); filter: blur(10px); opacity: .22; z-index: -1; }
      .sc-btn-primary { position: relative; overflow: hidden; background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, #7c3aed)); color: var(--accent-contrast); transition: opacity .15s, transform .1s, box-shadow .15s; box-shadow: 0 16px 30px -16px var(--accent); }
      .sc-btn-primary:hover:not(:disabled) { opacity: .96; transform: translateY(-1px); box-shadow: 0 18px 34px -16px var(--accent); }
      .sc-btn-ghost { background: color-mix(in srgb, var(--surface) 88%, transparent); border: 1px solid var(--border); color: var(--text); transition: background .15s, transform .1s, border-color .15s; }
      .sc-btn-ghost:hover { background: color-mix(in srgb, var(--surface) 78%, var(--accent) 8%); border-color: color-mix(in srgb, var(--accent) 45%, var(--border)); transform: translateY(-1px); }
      .sc-input-wrap { transition: transform .16s ease, box-shadow .16s ease; border-radius: .85rem; }
      .sc-input-wrap:focus-within { transform: translateY(-1px); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 14%, transparent); }
      .sc-spinner { width: 14px; height: 14px; border-radius: 9999px; border: 2px solid rgba(255,255,255,.45); border-top-color: #fff; animation: spin .8s linear infinite; }
    `}</style>
  );
}

export default GlobalStyles;