function VideoEmbed({ url }) {
  const yt = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (yt) {
    return (
      <div className="mt-3 rounded-lg overflow-hidden">
        <iframe width="100%" height="200" src={`https://www.youtube.com/embed/${yt[1]}`}
          style={{ border: 0 }} allowFullScreen className="block rounded-lg" />
      </div>
    );
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[var(--accent)] text-sm font-medium mt-2 hover:underline">
      ▶ Open Link
    </a>
  );
}

export default VideoEmbed;