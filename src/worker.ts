import { definePlugin, runWorker } from "@paperclipai/plugin-sdk";
import type { Goal, Issue, PluginContext } from "@paperclipai/plugin-sdk";

const PAGE_SIZE = 200;

type LinkRow = { issue_id: string };
type GoalLinkRow = { goal_id: string };

function textParam(params: Record<string, unknown>, key: string): string {
  const value = params[key];
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${key} is required`);
  }
  return value.trim();
}

function tableName(namespace: string): string {
  return `${namespace}.goal_issue_links`;
}

async function listAllIssues(ctx: PluginContext, companyId: string): Promise<Issue[]> {
  const all: Issue[] = [];
  for (let offset = 0; offset < 10_000; offset += PAGE_SIZE) {
    const page = await ctx.issues.list({ companyId, limit: PAGE_SIZE, offset });
    all.push(...page);
    if (page.length < PAGE_SIZE) break;
  }
  return all;
}

async function getRelatedIssueIds(
  ctx: PluginContext,
  companyId: string,
  goalId: string,
): Promise<Set<string>> {
  const rows = await ctx.db.query<LinkRow>(
    `SELECT issue_id FROM ${tableName(ctx.db.namespace)} WHERE company_id = $1 AND goal_id = $2`,
    [companyId, goalId],
  );
  return new Set(rows.map((row) => row.issue_id));
}

async function getRelatedGoalIds(
  ctx: PluginContext,
  companyId: string,
  issueId: string,
): Promise<Set<string>> {
  const rows = await ctx.db.query<GoalLinkRow>(
    `SELECT goal_id FROM ${tableName(ctx.db.namespace)} WHERE company_id = $1 AND issue_id = $2`,
    [companyId, issueId],
  );
  return new Set(rows.map((row) => row.goal_id));
}

type GoalIssuesData = {
  goal: Goal;
  goals: Goal[];
  related: Array<Issue & { relationship: "core" | "plugin" | "both" }>;
  available: Issue[];
};

type IssueGoalsData = {
  issue: Issue;
  related: Array<Goal & { relationship: "core" | "plugin" | "both" }>;
  available: Goal[];
};

async function readGoalIssues(
  ctx: PluginContext,
  companyId: string,
  goalId: string,
): Promise<GoalIssuesData> {
  const [goal, goals, issues, pluginIssueIds] = await Promise.all([
    ctx.goals.get(goalId, companyId),
    ctx.goals.list({ companyId, limit: 500 }),
    listAllIssues(ctx, companyId),
    getRelatedIssueIds(ctx, companyId, goalId),
  ]);
  if (!goal) throw new Error("Goal not found");

  const related = issues
    .filter((issue) => issue.goalId === goalId || pluginIssueIds.has(issue.id))
    .map((issue) => ({
      ...issue,
      relationship: (issue.goalId === goalId
        ? (pluginIssueIds.has(issue.id) ? "both" : "core")
        : "plugin") as "core" | "plugin" | "both",
    }));
  const relatedIds = new Set(related.map((issue) => issue.id));

  return {
    goal,
    goals,
    related,
    available: issues.filter((issue) => !relatedIds.has(issue.id)),
  };
}

async function readIssueGoals(
  ctx: PluginContext,
  companyId: string,
  issueId: string,
): Promise<IssueGoalsData> {
  const [issue, goals, pluginGoalIds] = await Promise.all([
    ctx.issues.get(issueId, companyId),
    ctx.goals.list({ companyId, limit: 500 }),
    getRelatedGoalIds(ctx, companyId, issueId),
  ]);
  if (!issue) throw new Error("Issue not found");

  const related = goals
    .filter((goal) => goal.id === issue.goalId || pluginGoalIds.has(goal.id))
    .map((goal) => ({
      ...goal,
      relationship: (goal.id === issue.goalId
        ? (pluginGoalIds.has(goal.id) ? "both" : "core")
        : "plugin") as "core" | "plugin" | "both",
    }));
  const relatedIds = new Set(related.map((goal) => goal.id));

  return {
    issue,
    related,
    available: goals.filter((goal) => !relatedIds.has(goal.id)),
  };
}

const plugin = definePlugin({
  async setup(ctx) {
    ctx.data.register("goal-issues", async (params): Promise<GoalIssuesData> => {
      const companyId = textParam(params, "companyId");
      const requestedGoalId = typeof params.goalId === "string" ? params.goalId.trim() : "";
      const goals = await ctx.goals.list({ companyId, limit: 500 });
      const goalId = requestedGoalId || goals[0]?.id;
      if (!goalId) throw new Error("No goals found");
      return readGoalIssues(ctx, companyId, goalId);
    });

    ctx.data.register("issue-goals", async (params): Promise<IssueGoalsData> => {
      const companyId = textParam(params, "companyId");
      const issueId = textParam(params, "issueId");
      return readIssueGoals(ctx, companyId, issueId);
    });

    ctx.actions.register("link-issue", async (params) => {
      const companyId = textParam(params, "companyId");
      const goalId = textParam(params, "goalId");
      const issueId = textParam(params, "issueId");
      const [goal, issue] = await Promise.all([
        ctx.goals.get(goalId, companyId),
        ctx.issues.get(issueId, companyId),
      ]);
      if (!goal) throw new Error("Goal not found");
      if (!issue) throw new Error("Issue not found");
      await ctx.db.execute(
        `INSERT INTO ${tableName(ctx.db.namespace)} (company_id, goal_id, issue_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (goal_id, issue_id) DO NOTHING`,
        [companyId, goalId, issueId],
      );
      return { linked: true, issueId, goalId };
    });

    ctx.actions.register("unlink-issue", async (params) => {
      const companyId = textParam(params, "companyId");
      const goalId = textParam(params, "goalId");
      const issueId = textParam(params, "issueId");
      const goal = await ctx.goals.get(goalId, companyId);
      if (!goal) throw new Error("Goal not found");
      await ctx.db.execute(
        `DELETE FROM ${tableName(ctx.db.namespace)}
         WHERE company_id = $1 AND goal_id = $2 AND issue_id = $3`,
        [companyId, goalId, issueId],
      );
      return { linked: false, issueId, goalId };
    });

    ctx.actions.register("link-goal", async (params) => {
      const companyId = textParam(params, "companyId");
      const issueId = textParam(params, "issueId");
      const goalId = textParam(params, "goalId");
      const [issue, goal] = await Promise.all([
        ctx.issues.get(issueId, companyId),
        ctx.goals.get(goalId, companyId),
      ]);
      if (!issue) throw new Error("Issue not found");
      if (!goal) throw new Error("Goal not found");
      await ctx.db.execute(
        `INSERT INTO ${tableName(ctx.db.namespace)} (company_id, goal_id, issue_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (goal_id, issue_id) DO NOTHING`,
        [companyId, goalId, issueId],
      );
      return { linked: true, issueId, goalId };
    });

    ctx.actions.register("unlink-goal", async (params) => {
      const companyId = textParam(params, "companyId");
      const issueId = textParam(params, "issueId");
      const goalId = textParam(params, "goalId");
      const issue = await ctx.issues.get(issueId, companyId);
      if (!issue) throw new Error("Issue not found");
      await ctx.db.execute(
        `DELETE FROM ${tableName(ctx.db.namespace)}
         WHERE company_id = $1 AND goal_id = $2 AND issue_id = $3`,
        [companyId, goalId, issueId],
      );
      return { linked: false, issueId, goalId };
    });
  },

  async onHealth() {
    return { status: "ok", message: "Goal Issues plugin is running" };
  }
});

export default plugin;
runWorker(plugin, import.meta.url);
