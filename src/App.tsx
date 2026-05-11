import { accountName, escalationEvidence, escalationGoal, escalationOwner } from "./data/escalation";
import { buildPrepBrief, buildTimeline, extractCommitments } from "./lib/escalation";

const timeline = buildTimeline(escalationEvidence);
const commitments = extractCommitments(escalationEvidence);
const prepBrief = buildPrepBrief(escalationEvidence, commitments);

export default function App() {
  const missedCount = commitments.filter((commitment) => commitment.status === "missed").length;
  const ambiguousCount = commitments.filter((commitment) => commitment.status === "ambiguous-owner").length;

  return (
    <main className="app-shell">
      <section className="hero" aria-labelledby="page-title">
        <div>
          <p className="system-label">Synthetic customer escalation workbench</p>
          <h1 id="page-title">Customer Escalation Timeline Builder</h1>
          <p className="hero-copy">
            Reconstruct what happened for {accountName}, expose missed promises, and prepare the account-saving call without mixing real customer data into the demo.
          </p>
        </div>
        <aside className="brief-panel" aria-label="Save-the-account prep brief">
          <span>Prep owner</span>
          <strong>{escalationOwner}</strong>
          <p>{escalationGoal}</p>
          <dl>
            <div>
              <dt>Missed dates</dt>
              <dd>{missedCount}</dd>
            </div>
            <div>
              <dt>Owner gaps</dt>
              <dd>{ambiguousCount}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="workspace" aria-label="Escalation evidence workspace">
        <div className="timeline-column">
          <div className="section-heading">
            <p>Chronological timeline</p>
            <h2>Source-backed escalation narrative</h2>
          </div>
          <ol className="timeline">
            {timeline.map((item) => (
              <li key={item.id} className={`timeline-item intensity-${item.intensity}`}>
                <div className="timeline-marker" aria-hidden="true" />
                <article>
                  <header>
                    <span>{item.displayTime}</span>
                    <strong>{item.id}</strong>
                  </header>
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                  <footer>
                    <span>{item.kind}</span>
                    <span>{item.actor}</span>
                  </footer>
                </article>
              </li>
            ))}
          </ol>
        </div>

        <div className="right-rail">
          <section className="ledger" aria-labelledby="commitment-heading">
            <div className="section-heading compact">
              <p>Commitment ledger</p>
              <h2 id="commitment-heading">Unresolved promises</h2>
            </div>
            <div className="commitment-list">
              {commitments.map((commitment) => (
                <article key={commitment.id} className={`commitment ${commitment.status}`}>
                  <div>
                    <span>{commitment.status.replace("-", " ")}</span>
                    <strong>{commitment.owner}</strong>
                  </div>
                  <p>{commitment.text}</p>
                  <footer>
                    <span>Due {commitment.dueLabel}</span>
                    <span>Source {commitment.sourceId}</span>
                  </footer>
                </article>
              ))}
            </div>
          </section>

          <section className="prep" aria-labelledby="prep-heading">
            <div className="section-heading compact">
              <p>Save-the-account prep brief</p>
              <h2 id="prep-heading">Call plan</h2>
            </div>
            <div className="memo">
              <p>{prepBrief.callLead}</p>
              <p>{prepBrief.riskLine}</p>
              <p>{prepBrief.nextAction}</p>
              <span>Latest source: {prepBrief.latestSource}</span>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
