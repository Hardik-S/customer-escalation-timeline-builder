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

const ownerPattern = /^(?<owner>[A-Z][A-Za-z0-9 &+/-]+?) (?:to|will) /;
const deadlineLeadPattern = /^(by|before|no later than) /i;
const datePattern =
  /(?:by|before|no later than) (?<month>Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?) (?<day>\d{1,2})(?:st|nd|rd|th)?(?:,? (?<time>\d{1,2}:\d{2}))?/i;
const monthIndex: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11
};
const fixtureYear = 2026;

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
      const dueMatch = text.match(datePattern);
      const due = parseDueDate(text);
      const ambiguous = owner === "Owner unclear" || owner === "Unassigned team member";
      const missed = due ? due.getTime() < now.getTime() : false;

      return {
        id: `${item.id}-${index + 1}`,
        sourceId: item.id,
        text,
        owner,
        dueLabel: due && dueMatch ? dueMatch[0].replace(deadlineLeadPattern, "") : "No date stated",
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
    riskLine: `${formatCount(missed.length, "missed commitment")} and ${formatCount(ambiguous.length, "owner ambiguity issue")} need explicit recovery language.`,
    nextAction:
      "Send an executive-ready written summary with replay proof, monitoring proof, named owner, and Friday renewal checkpoint agenda.",
    latestSource: latest ? `${latest.id}: ${latest.title}` : "No source evidence"
  };
}

function formatCount(count: number, singularLabel: string): string {
  return `${count} ${singularLabel}${count === 1 ? "" : "s"}`;
}

function parseDueDate(text: string): Date | null {
  const match = text.match(datePattern);
  if (!match?.groups) {
    return null;
  }

  const month = monthIndex[match.groups.month.toLowerCase()];
  const day = Number(match.groups.day);
  const [hour = "17", minute = "00"] = (match.groups.time ?? "17:00").split(":");
  const parsed = new Date(fixtureYear, month, day, Number(hour), Number(minute));

  if (
    parsed.getFullYear() !== fixtureYear ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day ||
    parsed.getHours() !== Number(hour) ||
    parsed.getMinutes() !== Number(minute)
  ) {
    return null;
  }

  return parsed;
}
