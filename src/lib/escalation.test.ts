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

  it("parses no-later-than recovery commitments", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3004",
        kind: "email",
        occurredAt: "2026-05-28T16:00:00-04:00",
        title: "Deadline framed as a latest acceptable time",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer asks for a recovery summary with no-later-than language.",
        commitments: ["CSM to send the revised replay summary no later than June 4 10:15."],
        sentiment: "urgent"
      }
    ]);

    expect(commitments[0].dueLabel).toBe("June 4 10:15");
    expect(commitments[0].dueAt).toEqual(new Date(2026, 5, 4, 10, 15));
    expect(commitments[0].status).toBe("unresolved");
  });

  it("recognizes owners in will-phrased recovery commitments", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3005",
        kind: "email",
        occurredAt: "2026-05-28T17:00:00-04:00",
        title: "Customer asks for direct ownership wording",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer forwards a recovery note written with will-language.",
        commitments: ["CSM will send monitoring proof by June 4 11:00."],
        sentiment: "concerned"
      }
    ]);

    expect(commitments[0].owner).toBe("CSM");
    expect(commitments[0].dueLabel).toBe("June 4 11:00");
    expect(commitments[0].status).toBe("unresolved");
  });

  it("recognizes tiered support owners in copied commitments", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3007",
        kind: "email",
        occurredAt: "2026-05-28T18:30:00-04:00",
        title: "Tiered support recovery owner",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer forwards a recovery task owned by a numbered support tier.",
        commitments: ["L2 Support to publish replay diagnostics by June 4 13:00."],
        sentiment: "urgent"
      }
    ]);

    expect(commitments[0].owner).toBe("L2 Support");
    expect(commitments[0].dueLabel).toBe("June 4 13:00");
    expect(commitments[0].status).toBe("unresolved");
  });

  it("recognizes joint owners in copied commitments", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3008",
        kind: "email",
        occurredAt: "2026-05-28T19:00:00-04:00",
        title: "Joint recovery owner",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer forwards a recovery task owned by a shared support pairing.",
        commitments: ["CSM & Support to publish monitoring recap by June 4 14:00."],
        sentiment: "urgent"
      }
    ]);

    expect(commitments[0].owner).toBe("CSM & Support");
    expect(commitments[0].dueLabel).toBe("June 4 14:00");
    expect(commitments[0].status).toBe("unresolved");
  });

  it("recognizes plus-separated joint owners in copied commitments", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3009",
        kind: "email",
        occurredAt: "2026-05-28T19:30:00-04:00",
        title: "Plus-separated recovery owner",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer forwards a recovery task owned by a pasted cross-functional pairing.",
        commitments: ["CSM + Support to publish monitoring proof by June 4 14:30."],
        sentiment: "urgent"
      }
    ]);

    expect(commitments[0].owner).toBe("CSM + Support");
    expect(commitments[0].dueLabel).toBe("June 4 14:30");
    expect(commitments[0].status).toBe("unresolved");
  });

  it("parses ordinal day suffixes in copied recovery deadlines", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3006",
        kind: "email",
        occurredAt: "2026-05-28T18:00:00-04:00",
        title: "Ordinal recovery deadline",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer forwards a copied recovery deadline with ordinal date copy.",
        commitments: ["Support to deliver replay audit by June 4th 10:15."],
        sentiment: "urgent"
      }
    ]);

    expect(commitments[0].dueLabel).toBe("June 4th 10:15");
    expect(commitments[0].dueAt).toEqual(new Date(2026, 5, 4, 10, 15));
    expect(commitments[0].status).toBe("unresolved");
  });

  it("parses EOD deadline copy as the customer-facing end of day", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3010",
        kind: "email",
        occurredAt: "2026-05-28T20:00:00-04:00",
        title: "EOD recovery deadline",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer forwards a recovery note with end-of-day deadline shorthand.",
        commitments: ["Support to send the replay completion packet by EOD June 4."],
        sentiment: "urgent"
      }
    ]);

    expect(commitments[0].dueLabel).toBe("EOD June 4");
    expect(commitments[0].dueAt).toEqual(new Date(2026, 5, 4, 17, 0));
    expect(commitments[0].status).toBe("unresolved");
  });

  it("parses due-date phrasing in copied recovery commitments", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3011",
        kind: "email",
        occurredAt: "2026-05-28T20:30:00-04:00",
        title: "Due-date recovery deadline",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "Customer forwards a recovery note with due-date task wording.",
        commitments: ["Support to publish the replay audit due June 4 16:00."],
        sentiment: "urgent"
      }
    ]);

    expect(commitments[0].dueLabel).toBe("June 4 16:00");
    expect(commitments[0].dueAt).toEqual(new Date(2026, 5, 4, 16, 0));
    expect(commitments[0].status).toBe("unresolved");
  });

  it("does not roll impossible calendar dates into later months", () => {
    const commitments = extractCommitments([
      {
        id: "EML-3003",
        kind: "email",
        occurredAt: "2026-05-28T15:00:00-04:00",
        title: "Invalid recovery checkpoint date",
        actor: "Maya Chen",
        source: "Customer email",
        summary: "The copied commitment contains an impossible calendar date.",
        commitments: ["Support to publish recovery recap by February 31 09:30."],
        sentiment: "concerned"
      }
    ]);

    expect(commitments[0].dueLabel).toBe("No date stated");
    expect(commitments[0].dueAt).toBeNull();
    expect(commitments[0].status).toBe("unresolved");
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
