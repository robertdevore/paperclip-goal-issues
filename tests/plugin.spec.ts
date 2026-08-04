import { describe, expect, it } from "vitest";
import { createTestHarness } from "@paperclipai/plugin-sdk/testing";
import type { Goal, Issue } from "@paperclipai/plugin-sdk";
import manifest from "../src/manifest.js";
import plugin from "../src/worker.js";

const now = new Date();

function issue(id: string, companyId: string, goalId: string | null): Issue {
  return {
    id, companyId, projectId: null, projectWorkspaceId: null, goalId, parentId: null,
    title: `Issue ${id}`, description: null, status: "todo", workMode: "standard", priority: "medium",
    assigneeAgentId: null, assigneeUserId: null, checkoutRunId: null, executionRunId: null,
    executionAgentNameKey: null, executionLockedAt: null, createdByAgentId: null, createdByUserId: null,
    responsibleUserId: null, issueNumber: null, identifier: `PAP-${id}`, originKind: "manual",
    originId: null, originRunId: null, originFingerprint: "default", requestDepth: 0, billingCode: null,
    assigneeAdapterOverrides: null, executionWorkspaceId: null, executionWorkspacePreference: null,
    executionWorkspaceSettings: null, startedAt: null, completedAt: null, cancelledAt: null, hiddenAt: null,
    createdAt: now, updatedAt: now,
  };
}

function goal(id: string, companyId: string): Goal {
  return { id, companyId, title: "Ship goal", description: null, level: "company", status: "active", parentId: null, ownerAgentId: null, createdAt: now, updatedAt: now };
}

describe("goal issues plugin", () => {
  it("declares the goal detail extension without adding a sidebar entry", () => {
    expect(manifest.capabilities).toEqual(expect.arrayContaining([
      "database.namespace.migrate", "database.namespace.read", "database.namespace.write",
      "goals.read", "issues.read", "ui.detailTab.register",
    ]));
    expect(manifest.ui?.slots).toEqual([
      expect.objectContaining({ type: "detailTab", entityTypes: ["goal"] }),
    ]);
  });

  it("returns core goal-linked issues and plugin-linked issues", async () => {
    const companyId = "company-1";
    const goalId = "goal-1";
    const harness = createTestHarness({ manifest });
    harness.seed({ goals: [goal(goalId, companyId)], issues: [
      issue("core", companyId, goalId), issue("other", companyId, null),
    ] });
    await plugin.definition.setup(harness.ctx);
    harness.ctx.db.query = async <T,>() => [{ issue_id: "other" } as T];

    const data = await harness.getData<{ related: Issue[]; available: Issue[] }>("goal-issues", { companyId, goalId });
    expect(data.related.map((row) => row.id)).toEqual(["core", "other"]);
    expect(data.available).toEqual([]);
  });

  it("writes and removes plugin-owned links after validating the goal", async () => {
    const companyId = "company-1";
    const goalId = "goal-1";
    const harness = createTestHarness({ manifest });
    harness.seed({ goals: [goal(goalId, companyId)], issues: [issue("issue-1", companyId, null)] });
    await plugin.definition.setup(harness.ctx);

    await harness.performAction("link-issue", { companyId, goalId, issueId: "issue-1" });
    await harness.performAction("unlink-issue", { companyId, goalId, issueId: "issue-1" });
    expect(harness.dbExecutes.map((entry) => entry.sql)).toEqual([
      expect.stringContaining("INSERT INTO"),
      expect.stringContaining("DELETE FROM"),
    ]);
  });
});
