function BackgroundBlur() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute -left-20 -top-24 w-80 h-80 rounded-full bg-[var(--accent)]/15 blur-3xl animate-pulse" />
      <div className="absolute right-[-5rem] bottom-[-7rem] w-96 h-96 rounded-full bg-[var(--accent)]/10 blur-3xl animate-pulse" />
    </div>
  );
}

export default BackgroundBlur;