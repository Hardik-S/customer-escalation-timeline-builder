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

  it("builds a save-the-account prep brief from unresolved evidence", () => {
    const commitments = extractCommitments(escalationEvidence);
    const brief = buildPrepBrief(escalationEvidence, commitments);
    expect(brief.riskLine).toContain("missed commitments");
    expect(brief.latestSource).toContain("Replay completed");
  });
});
