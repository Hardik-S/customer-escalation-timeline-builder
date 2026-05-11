import type { EscalationEvidence } from "../data/escalation";

export interface TimelineItem extends EscalationEvidence {
  displayTime: string;
  intensity: number;
}

export interface Commitment {
  id: string;
  sourceId: string;
  text: string;
  owner: string;
  dueLabel: string;
  dueAt: Date | null;
  status: "missed" | "unresolved" | "ambiguous-owner" | "covered";
}

const ownerPattern = /^(?<owner>[A-Z][A-Za-z ]+|Support|Engineering|CSM|Account team|Unassigned team member) to /;
const datePattern = /by (?<month>Apr|May) (?<day>\d{1,2})( (?<time>\d{1,2}:\d{2}))?/;
const monthIndex: Record<string, number> = { Apr: 3, May: 4 };

export function buildTimeline(evidence: EscalationEvidence[]): TimelineItem[] {
  return [...evidence]
    .sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime())
    .map((item) => ({
      ...item,
      displayTime: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
      }).format(new Date(item.occurredAt)),
      intensity: item.sentiment === "urgent" ? 3 : item.sentiment === "concerned" ? 2 : 1
    }));
}

export function extractCommitments(evidence: EscalationEvidence[], now = new Date("2026-05-01T17:00:00-04:00")): Commitment[] {
  return evidence.flatMap((item) =>
    item.commitments.map((text, index) => {
      const owner = text.match(ownerPattern)?.groups?.owner ?? "Owner unclear";
      const due = parseDueDate(text);
      const ambiguous = owner === "Owner unclear" || owner === "Unassigned team member";
      const missed = due ? due.getTime() < now.getTime() : false;

      return {
        id: `${item.id}-${index + 1}`,
        sourceId: item.id,
        text,
        owner,
        dueLabel: text.match(datePattern)?.[0].replace("by ", "") ?? "No date stated",
        dueAt: due,
        status: ambiguous ? "ambiguous-owner" : missed ? "missed" : "unresolved"
      };
    })
  );
}

export function buildPrepBrief(evidence: EscalationEvidence[], commitments: Commitment[]) {
  const missed = commitments.filter((commitment) => commitment.status === "missed");
  const ambiguous = commitments.filter((commitment) => commitment.status === "ambiguous-owner");
  const latest = buildTimeline(evidence).at(-1);

  return {
    callLead: "Open with the replay-complete evidence, then acknowledge the missed commitment timestamps directly.",
    riskLine: `${missed.length} missed commitments and ${ambiguous.length} owner ambiguity issue need explicit recovery language.`,
    nextAction:
      "Send an executive-ready written summary with replay proof, monitoring proof, named owner, and Friday renewal checkpoint agenda.",
    latestSource: latest ? `${latest.id}: ${latest.title}` : "No source evidence"
  };
}

function parseDueDate(text: string): Date | null {
  const match = text.match(datePattern);
  if (!match?.groups) {
    return null;
  }

  const month = monthIndex[match.groups.month];
  const day = Number(match.groups.day);
  const [hour = "17", minute = "00"] = (match.groups.time ?? "17:00").split(":");
  return new Date(2026, month, day, Number(hour), Number(minute));
}
