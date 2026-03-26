function ErrorMessage({ error }) {
  if (!error) return null;
  return (
    <div className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2.5 rounded-lg mb-4 animate-in fade-in duration-300">
      {error}
    </div>
  );
}

export default ErrorMessage;