"use client";

import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { useState } from "react";
import type { LeadScore, ScoreLeadInput } from "@/lib/tools/score-lead";

type ChatMessage = UIMessage<
  never,
  never,
  { scoreLead: { input: ScoreLeadInput; output: LeadScore } }
>;

const initialLead: ScoreLeadInput = {
  name: "Priya Sharma",
  company: "Northstar Analytics",
  jobTitle: "VP of Revenue Operations",
  companySize: "201-1000",
  buyingIntent: "evaluating",
};

export default function Home() {
  const [lead, setLead] = useState(initialLead);
  const { messages, sendMessage, status, error } = useChat<ChatMessage>();
  const isBusy = status === "submitted" || status === "streaming";

  function updateLead<K extends keyof ScoreLeadInput>(key: K, value: ScoreLeadInput[K]) {
    setLead((current) => ({ ...current, [key]: value }));
  }

  function scoreCurrentLead() {
    sendMessage({ text: `Score lead: ${JSON.stringify(lead)}` });
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Signal home">
          <span className="brand-mark">s</span>
          <span>signal<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <button className="workspace-switcher">
          <span className="workspace-avatar">N</span>
          <span className="workspace-name">Northstar team</span>
          <span className="chevron">⌄</span>
        </button>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a href="#" className="nav-item">
            <GridIcon /> Overview
          </a>
          <a href="#" className="nav-item active">
            <TargetIcon /> Lead scoring
            <span className="nav-count">1</span>
          </a>
          <a href="#" className="nav-item muted">
            <ClockIcon /> Activity
          </a>
        </nav>
        <div className="sidebar-bottom">
          <div className="plan-card">
            <span className="plan-icon">✳</span>
            <div>
              <strong>AI workspace</strong>
              <span>Tools ready to use</span>
            </div>
            <span className="status-dot" />
          </div>
          <button className="profile-button">
            <span className="profile-avatar">JS</span>
            <span className="profile-copy"><strong>Jordan Smith</strong><small>Sales team</small></span>
            <span className="chevron">···</span>
          </button>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="crumb-slash">/</span><strong>Lead scoring</strong></div>
          <div className="topbar-right">
            <span className="live-status"><span className="status-dot" /> System operational</span>
            <button className="help-button" aria-label="Help">?</button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-intro">
            <div>
              <div className="eyebrow"><span className="eyebrow-mark">✳</span> AI-POWERED WORKFLOW</div>
              <h1>Find your next <span>best customer.</span></h1>
              <p>Turn the signals you already have into a clear next step for every lead.</p>
            </div>
            <div className="updated-note"><span className="pulse-dot" /> Ready when you are</div>
          </div>

          <div className="workspace-grid">
            <section className="panel lead-panel" aria-labelledby="lead-heading">
              <div className="panel-header">
                <div>
                  <div className="section-kicker">01 <span>·</span> LEAD PROFILE</div>
                  <h2 id="lead-heading">Who are we looking at?</h2>
                </div>
                <span className="panel-icon"><PersonIcon /></span>
              </div>
              <div className="form-grid">
                <label className="field full-width">
                  <span>Full name</span>
                  <input value={lead.name} onChange={(event) => updateLead("name", event.target.value)} />
                </label>
                <label className="field full-width">
                  <span>Company</span>
                  <input value={lead.company} onChange={(event) => updateLead("company", event.target.value)} />
                </label>
                <label className="field full-width">
                  <span>Job title</span>
                  <input value={lead.jobTitle} onChange={(event) => updateLead("jobTitle", event.target.value)} />
                </label>
                <label className="field">
                  <span>Company size</span>
                  <select value={lead.companySize} onChange={(event) => updateLead("companySize", event.target.value as ScoreLeadInput["companySize"])}>
                    <option value="1-50">1–50 people</option>
                    <option value="51-200">51–200 people</option>
                    <option value="201-1000">201–1,000 people</option>
                    <option value="1000+">1,000+ people</option>
                  </select>
                </label>
                <label className="field">
                  <span>Buying intent</span>
                  <select value={lead.buyingIntent} onChange={(event) => updateLead("buyingIntent", event.target.value as ScoreLeadInput["buyingIntent"])}>
                    <option value="exploring">Exploring</option>
                    <option value="evaluating">Evaluating</option>
                    <option value="ready">Ready to buy</option>
                  </select>
                </label>
              </div>
              <div className="form-footer">
                <p><ShieldIcon /> Your lead data stays in this workspace.</p>
                <button className="score-button" onClick={scoreCurrentLead} disabled={isBusy}>
                  {isBusy ? <span className="button-spinner" /> : <SparkleIcon />}
                  {isBusy ? "Scoring…" : "Score this lead"}
                  {!isBusy && <span className="button-arrow">↗</span>}
                </button>
              </div>
            </section>

            <section className="panel copilot-panel" aria-labelledby="copilot-heading">
              <div className="copilot-header">
                <div className="copilot-avatar"><SparkleIcon /></div>
                <div className="copilot-title">
                  <h2 id="copilot-heading">Signal copilot</h2>
                  <span><span className="status-dot" /> Connected to lead scoring</span>
                </div>
                <button className="more-button" aria-label="More options">···</button>
              </div>

              <div className="chat-body" aria-live="polite">
                {messages.length === 0 ? (
                  <div className="empty-chat">
                    <div className="empty-orbit"><SparkleIcon /></div>
                    <h3>A little context goes a long way.</h3>
                    <p>I’ll look at fit and intent, then give you a clear recommendation to act on.</p>
                    <div className="suggestion">
                      <span className="suggestion-mark">↳</span>
                      <span>Score a lead using their role, company size, and buying intent.</span>
                    </div>
                  </div>
                ) : (
                  <div className="message-list">
                    {messages.map((message) => (
                      <article key={message.id} className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
                        <div className="message-meta">
                          <span className={`message-avatar ${message.role === "user" ? "user-avatar" : "ai-avatar"}`}>
                            {message.role === "user" ? "JS" : <SparkleIcon />}
                          </span>
                          <strong>{message.role === "user" ? "You" : "Signal"}</strong>
                          {message.role === "assistant" && <span className="assistant-label">COPILOT</span>}
                        </div>
                        <div className="message-content">
                          {message.parts.map((part, index) => {
                            if (part.type === "text") {
                              return <p className="message-text" key={`${message.id}-text-${index}`}>{part.text}</p>;
                            }
                            if (part.type === "tool-scoreLead") {
                              return <ToolPart key={part.toolCallId} part={part} />;
                            }
                            return null;
                          })}
                        </div>
                      </article>
                    ))}
                    {error && <div className="request-error" role="alert">The request couldn’t be completed. Check your connection and try again.</div>}
                  </div>
                )}
              </div>
              <div className="chat-composer">
                <button className="composer-action" onClick={scoreCurrentLead} disabled={isBusy} aria-label="Score current lead"><SparkleIcon /></button>
                <button className="composer-text" onClick={scoreCurrentLead} disabled={isBusy}>
                  {isBusy ? "Signal is working…" : "Ask Signal to score this lead"}
                </button>
                <span className="composer-hint">↵</span>
              </div>
              <div className="chat-footnote"><LockIcon /> AI can make mistakes. Review recommendations before acting.</div>
            </section>
          </div>

          <div className="bottom-note"><span className="note-star">✳</span> A strong signal isn’t a guarantee. It’s a better place to start.</div>
        </div>
      </section>
    </main>
  );
}

type ScoreLeadPart = Extract<ChatMessage["parts"][number], { type: "tool-scoreLead" }>;

function ToolPart({ part }: { part: ScoreLeadPart }) {
  if (part.state === "input-streaming") {
    return (
      <div className="tool-state tool-streaming">
        <div className="tool-state-icon"><span className="orbit-spinner" /></div>
        <div><span className="tool-state-label">SCORING IN PROGRESS</span><strong>Reading lead signals</strong><p>Checking the role, company fit, and buying intent…</p></div>
      </div>
    );
  }

  if (part.state === "input-available") {
    return (
      <div className="tool-state tool-input">
        <div className="tool-state-icon"><TargetIcon /></div>
        <div className="tool-input-copy">
          <span className="tool-state-label">TOOL INPUT · SCORE LEAD</span>
          <strong>Qualifying {part.input.name}</strong>
          <p>{part.input.jobTitle} <span>·</span> {part.input.company} <span>·</span> {part.input.companySize} employees</p>
          <div className="input-intent"><span className="intent-dot" /> {part.input.buyingIntent} buying intent</div>
        </div>
      </div>
    );
  }

  if (part.state === "output-error") {
    return (
      <div className="tool-state tool-error" role="alert">
        <div className="tool-state-icon"><ErrorIcon /></div>
        <div><span className="tool-state-label">TOOL ERROR · SCORE LEAD</span><strong>We couldn’t score this lead.</strong><p>{part.errorText || "The scoring service had a problem. Check the lead details and try again."}</p></div>
      </div>
    );
  }

  if (part.state !== "output-available") {
    return null;
  }

  const result = part.output;
  return (
    <section className={`score-card tier-${result.tier}`} aria-label={`${result.tier} lead score`}>
      <div className="score-card-top">
        <div>
          <span className="tool-state-label">LEAD SCORE · {result.tier.toUpperCase()} PRIORITY</span>
          <h3>{part.input.name}<span> · </span>{part.input.company}</h3>
        </div>
        <div className="score-ring" aria-label={`Score ${result.score} out of 100`}>
          <span>{result.score}</span><small>/100</small>
        </div>
      </div>
      <div className="score-meter"><span style={{ width: `${result.score}%` }} /></div>
      <p className="score-summary">{result.summary}</p>
      <div className="signals-heading"><span>WHAT WE NOTICED</span><span>{result.signals.length} signals</span></div>
      <ul className="signal-list">
        {result.signals.map((signal) => (
          <li key={signal.label}>
            <span className={`signal-indicator ${signal.impact}`}><SignalIcon /></span>
            <span className="signal-copy"><strong>{signal.label}</strong><small>{signal.detail}</small></span>
            <span className={`impact-tag ${signal.impact}`}>{signal.impact === "positive" ? "Positive" : signal.impact === "negative" ? "Watch" : "Neutral"}</span>
          </li>
        ))}
      </ul>
      <div className="score-card-footer"><span><ShieldIcon /> Evidence-based score</span><span>Just now</span></div>
    </section>
  );
}

function GridIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx="1" /><rect x="12" y="3" width="5" height="5" rx="1" /><rect x="3" y="12" width="5" height="5" rx="1" /><rect x="12" y="12" width="5" height="5" rx="1" /></svg>;
}

function TargetIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="6.5" /><circle cx="10" cy="10" r="2.5" /><path d="m10 10 5-5" /></svg>;
}

function ClockIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 6v4l3 2" /></svg>;
}

function PersonIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="6.5" r="2.7" /><path d="M4.5 16c.5-2.7 2.4-4.1 5.5-4.1s5 1.4 5.5 4.1" /></svg>;
}

function SparkleIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m10 2 1.7 5.3L17 9l-5.3 1.7L10 16l-1.7-5.3L3 9l5.3-1.7L10 2Z" /><path d="m16 13 .7 2.3L19 16l-2.3.7L16 19l-.7-2.3L13 16l2.3-.7L16 13Z" /></svg>;
}

function ShieldIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2 13 4v3.5c0 3-2 5.3-5 6.5-3-1.2-5-3.5-5-6.5V4l5-2Z" /><path d="m5.8 7.8 1.4 1.4 3-3" /></svg>;
}

function LockIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="3.2" y="7" width="9.6" height="7" rx="1.5" /><path d="M5.2 7V5a2.8 2.8 0 0 1 5.6 0v2" /></svg>;
}

function ErrorIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7" /><path d="M10 6v4m0 3h.01" /></svg>;
}

function SignalIcon() {
  return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8 3 3 7-7" /></svg>;
}
