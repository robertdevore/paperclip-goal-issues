import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

// `badgeExportName` is supported by Paperclip hosts that implement dynamic
// detail-tab badges. Keep the declaration in the emitted manifest while
// allowing this package to typecheck against the currently published SDK,
// whose type definition predates that optional field.
const goalIssuesSlot = {
  type: "detailTab" as const,
  id: "goal-issues-detail-tab",
  displayName: "Related Issues",
  exportName: "GoalIssuesDetailTab",
  badgeExportName: "GoalIssuesTabBadge",
  entityTypes: ["goal" as const],
  order: 40,
};

const issueGoalsSlot = {
  type: "detailTab" as const,
  id: "issue-goals-detail-tab",
  displayName: "Goals",
  exportName: "IssueGoalsDetailTab",
  entityTypes: ["issue" as const],
  order: 40,
};

const manifest: PaperclipPluginManifestV1 = {
  id: "robertdevore.paperclip-goal-issues",
  apiVersion: 1,
  version: "0.1.0",
  displayName: "Goal Issues",
  description: "Track issues related to Paperclip goals without changing Paperclip core.",
  author: "Robert DeVore",
  categories: ["ui"],
  capabilities: [
    "database.namespace.migrate",
    "database.namespace.read",
    "database.namespace.write",
    "goals.read",
    "issues.read",
    "ui.detailTab.register"
  ],
  entrypoints: {
    worker: "./dist/worker.js",
    ui: "./dist/ui"
  },
  database: {
    namespaceSlug: "goal_issues",
    migrationsDir: "migrations",
    coreReadTables: ["goals", "issues"]
  },
  ui: {
    slots: [goalIssuesSlot, issueGoalsSlot]
  }
};

export default manifest;
