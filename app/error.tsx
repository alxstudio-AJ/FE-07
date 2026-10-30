"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Lead scoring route failed:", error);
  }, [error]);

  return (
    <main className="route-state">
      <div className="route-state-card" role="alert">
        <span className="route-state-icon"><ErrorIcon /></span>
        <p className="eyebrow">SIGNAL WORKSPACE</p>
        <h1>This workspace hit a snag.</h1>
        <p>We couldn’t load lead scoring. Your lead details are safe; try loading the workspace again.</p>
        <button className="score-button" onClick={retry}>Try again</button>
      </div>
    </main>
  );
}

function ErrorIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 6v4m0 3h.01" /></svg>;
}
