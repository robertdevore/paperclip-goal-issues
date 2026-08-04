import type { PaperclipPluginManifestV1 } from "@paperclipai/plugin-sdk";

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
    "ui.detailTab.register",
    "ui.page.register",
    "ui.sidebar.register"
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
    slots: [
      {
        type: "sidebar",
        id: "goal-issues-sidebar",
        displayName: "Goal Issues",
        exportName: "GoalIssuesSidebar",
        order: 65
      },
      {
        type: "page",
        id: "goal-issues-page",
        displayName: "Goal Issues",
        exportName: "GoalIssuesPage",
        routePath: "goal-issues"
      },
      {
        type: "detailTab",
        id: "goal-issues-detail-tab",
        displayName: "Related Issues",
        exportName: "GoalIssuesDetailTab",
        entityTypes: ["goal"],
        order: 40
      }
    ]
  }
};

export default manifest;
