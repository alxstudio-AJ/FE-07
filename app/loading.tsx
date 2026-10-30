export default function Loading() {
  return (
    <main className="route-loading" aria-label="Loading Signal lead scoring">
      <header className="route-loading-header">
        <span className="skeleton-block skeleton-brand" />
        <span className="skeleton-block skeleton-status" />
      </header>
      <section className="route-loading-content">
        <span className="skeleton-block skeleton-eyebrow" />
        <span className="skeleton-block skeleton-title" />
        <span className="skeleton-block skeleton-subtitle" />
        <div className="route-loading-grid">
          <div className="route-loading-panel">
            <span className="skeleton-block skeleton-panel-title" />
            <span className="skeleton-block skeleton-field" />
            <span className="skeleton-block skeleton-field" />
            <span className="skeleton-block skeleton-field" />
            <span className="skeleton-block skeleton-action" />
          </div>
          <div className="route-loading-panel route-loading-chat">
            <span className="skeleton-block skeleton-panel-title" />
            <span className="skeleton-block skeleton-chat-line" />
            <span className="skeleton-block skeleton-chat-line" />
            <span className="skeleton-block skeleton-chat-card" />
          </div>
        </div>
      </section>
    </main>
  );
}
