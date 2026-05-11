export type EvidenceKind = "ticket" | "email" | "call-note";

export interface EscalationEvidence {
  id: string;
  kind: EvidenceKind;
  occurredAt: string;
  title: string;
  actor: string;
  source: string;
  summary: string;
  commitments: string[];
  sentiment: "neutral" | "concerned" | "urgent" | "recovered";
}

export const accountName = "Blue Harbor Logistics";
export const escalationOwner = "Maya Chen, Support Manager";
export const escalationGoal = "Recover executive confidence before the Friday renewal checkpoint.";

export const escalationEvidence: EscalationEvidence[] = [
  {
    id: "TCK-1042",
    kind: "ticket",
    occurredAt: "2026-04-28T09:12:00-04:00",
    title: "Warehouse import failures after schema update",
    actor: "Jules Rivera, Operations Lead",
    source: "Priority ticket",
    summary:
      "Customer reports that nightly warehouse imports failed twice after the new carrier-code field shipped.",
    commitments: ["Support to confirm whether historical imports can be replayed by Apr 29 12:00."],
    sentiment: "concerned"
  },
  {
    id: "EML-2190",
    kind: "email",
    occurredAt: "2026-04-29T15:35:00-04:00",
    title: "Replay estimate moved without owner",
    actor: "Priya N., Customer Ops",
    source: "Customer email",
    summary:
      "Customer notes the replay estimate slipped past noon and asks who owns the recovery plan.",
    commitments: ["Account team to name a single recovery owner by Apr 29 17:00."],
    sentiment: "urgent"
  },
  {
    id: "CALL-073",
    kind: "call-note",
    occurredAt: "2026-04-30T10:00:00-04:00",
    title: "Escalation call with VP Operations",
    actor: "Maya Chen",
    source: "Call note",
    summary:
      "VP Operations says renewal confidence depends on a written replay plan and proof that future imports are monitored.",
    commitments: [
      "Engineering to deliver replay plan by Apr 30 16:00.",
      "CSM to send monitoring proof by May 1 10:00."
    ],
    sentiment: "urgent"
  },
  {
    id: "EML-2214",
    kind: "email",
    occurredAt: "2026-05-01T11:20:00-04:00",
    title: "Monitoring proof sent late",
    actor: "Nora Patel, CSM",
    source: "Outbound email",
    summary:
      "CSM sends a dashboard screenshot after the promised time and does not confirm whether replay completed.",
    commitments: ["Support to confirm replay completion by May 1 15:00."],
    sentiment: "neutral"
  },
  {
    id: "TCK-1057",
    kind: "ticket",
    occurredAt: "2026-05-01T16:45:00-04:00",
    title: "Replay completed, executive summary missing",
    actor: "Arun Mehta, Engineering",
    source: "Internal ticket update",
    summary:
      "Engineering marks replay complete but the account-facing summary still needs owner assignment and send approval.",
    commitments: ["Unassigned team member to send executive-ready summary before May 2 09:00."],
    sentiment: "recovered"
  }
];
