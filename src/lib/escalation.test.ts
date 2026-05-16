import { describe, expect, it } from "vitest";
import { escalationEvidence } from "../data/escalation";
import { buildPrepBrief, buildTimeline, extractCommitments } from "./escalation";

describe("customer escalation timeline", () => {
  it("sorts mixed source evidence chronologically", () => {
    const timeline = buildTimeline([...escalationEvidence].reverse());
    expect(timeline.map((item) => item.id)).toEqual(["TCK-1042", "EML-2190", "CALL-073", "EML-2214", "TCK-1057"]);
  });

  it("marks missed commitments and ambiguous owners", () => {
    const commitments = extractCommitments(escalationEvidence);
    expect(commitments.some((commitment) => commitment.status === "missed")).toBe(true);
    expect(commitments.find((commitment) => commitment.sourceId === "TCK-1057")?.status).toBe("ambiguous-owner");
  });

  it("parses due dates written with before language", () => {
    const commitments = extractCommitments(escalationEvidence);
    const executiveSummary = commitments.find((commitment) => commitment.sourceId === "TCK-1057");

    expect(executiveSummary?.dueLabel).toBe("May 2 09:00");
    expect(executiveSummary?.dueAt).toEqual(new Date(2026, 4, 2, 9, 0));
  });

  it("parses full month names for later recovery commitments", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3001",
        kind: "email",
        occurredAt: "2026-05-28T13:00:00-04:00",
        title: "Recovery checkpoint moved into June",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer asks for a named recap before the June steering review.",
        commitments: ["Customer Success to publish recovery recap by June 3 09:30."],
        sentiment: "concerned"
      }
    ]);

    expect(commitments[0].dueLabel).toBe("June 3 09:30");
    expect(commitments[0].dueAt).toEqual(new Date(2026, 5, 3, 9, 30));
    expect(commitments[0].status).toBe("unresolved");
  });

  it("keeps explicit times when deadline copy includes a comma", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3002",
        kind: "email",
        occurredAt: "2026-05-28T14:00:00-04:00",
        title: "Comma-formatted recovery checkpoint",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer asks for a timed recap in comma-formatted deadline copy.",
        commitments: ["Customer Success to publish recovery recap by June 3, 09:30."],
        sentiment: "concerned"
      }
    ]);

    expect(commitments[0].dueLabel).toBe("June 3, 09:30");
    expect(commitments[0].dueAt).toEqual(new Date(2026, 5, 3, 9, 30));
  });

  it("builds a save-the-account prep brief from unresolved evidence", () => {
    const commitments = extractCommitments(escalationEvidence);
    const brief = buildPrepBrief(escalationEvidence, commitments);
    expect(brief.riskLine).toContain("missed commitments");
    expect(brief.latestSource).toContain("Replay completed");
  });

  it("keeps prep-brief risk wording grammatical for singular counts", () => {
    const commitments = [
      {
        id: "single-missed",
        sourceId: "TCK-1",
        text: "CSM to send customer replay proof by Apr 30",
        owner: "CSM",
        dueLabel: "Apr 30",
        dueAt: new Date(2026, 3, 30),
        status: "missed" as const
      },
      {
        id: "single-ambiguous",
        sourceId: "TCK-2",
        text: "Unassigned team member to confirm executive owner by May 2",
        owner: "Unassigned team member",
        dueLabel: "May 2",
        dueAt: new Date(2026, 4, 2),
        status: "ambiguous-owner" as const
      }
    ];

    const brief = buildPrepBrief(escalationEvidence, commitments);

    expect(brief.riskLine).toBe("1 missed commitment and 1 owner ambiguity issue need explicit recovery language.");
  });
});
