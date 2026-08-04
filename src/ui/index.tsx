import {
  useHostNavigation,
  usePluginAction,
  usePluginData,
  type PluginDetailTabProps,
  type PluginPageProps,
  type PluginSidebarProps,
} from "@paperclipai/plugin-sdk/ui";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Goal, Issue } from "@paperclipai/plugin-sdk";

type RelatedIssue = Issue & { relationship: "core" | "plugin" | "both" };
type GoalIssuesData = { goal: Goal; goals: Goal[]; related: RelatedIssue[]; available: Issue[] };

const PLUGIN_ROUTE = "/goal-issues";

function issueRef(issue: Issue): string {
  return issue.identifier ?? issue.id;
}

function IssueLink({ issue, children }: { issue: Issue; children: ReactNode }) {
  const navigation = useHostNavigation();
  return <a {...navigation.linkProps(`/issues/${encodeURIComponent(issueRef(issue))}`)} style={{ color: "inherit", textDecoration: "none" }}>{children}</a>;
}

function SidebarIcon() {
  return <span aria-hidden="true" style={{ fontSize: "1rem" }}>◎</span>;
}

export function GoalIssuesSidebar({ context }: PluginSidebarProps) {
  const navigation = useHostNavigation();
  const active = typeof window !== "undefined" && window.location.pathname.endsWith(PLUGIN_ROUTE);
  return (
    <a
      {...navigation.linkProps(PLUGIN_ROUTE)}
      aria-current={active ? "page" : undefined}
      title="Goal Issues"
      style={{ display: "flex", alignItems: "center", gap: "0.625rem", margin: "0 0.5rem", padding: "0.375rem 0.5rem", borderRadius: "0.5rem", color: "inherit", textDecoration: "none", opacity: active ? 1 : 0.8 }}
    >
      <SidebarIcon />
      <span>Goal Issues</span>
    </a>
  );
}

function GoalIssuesSurface({ context }: { context: { companyId: string | null; entityId?: string | null } }) {
  const [goalId, setGoalId] = useState(context.entityId ?? "");
  const [search, setSearch] = useState("");
  const { data, loading, error, refresh } = usePluginData<GoalIssuesData>("goal-issues", {
    companyId: context.companyId,
    goalId,
  });
  const linkIssue = usePluginAction("link-issue");
  const unlinkIssue = usePluginAction("unlink-issue");
  const [pendingIssueId, setPendingIssueId] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId && data?.goals[0]) setGoalId(data.goals[0].id);
  }, [data?.goals, goalId]);

  const available = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return data?.available ?? [];
    return (data?.available ?? []).filter((issue) => `${issue.identifier ?? ""} ${issue.title}`.toLowerCase().includes(needle));
  }, [data?.available, search]);

  if (!context.companyId) return <p>Select a company to view goal issues.</p>;
  if (!goalId) return <p>{loading ? "Loading goals…" : "No goals found."}</p>;
  if (loading && !data) return <p>Loading goal issues…</p>;
  if (error) return <p role="alert">Unable to load goal issues: {error.message}</p>;
  if (!data) return null;

  async function mutate(action: typeof linkIssue, issueId: string) {
    setPendingIssueId(issueId);
    try {
      await action({ companyId: context.companyId, goalId, issueId });
      await refresh();
    } finally {
      setPendingIssueId(null);
    }
  }

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.25rem" }}>Goal Issues</h1>
          <p style={{ margin: "0.25rem 0 0", opacity: 0.7 }}>Track the work that moves a goal forward.</p>
        </div>
        <button type="button" onClick={() => void refresh()}>Refresh</button>
      </header>

      <label style={{ display: "grid", gap: "0.375rem", maxWidth: "32rem" }}>
        <span>Goal</span>
        <select value={goalId} onChange={(event) => setGoalId(event.currentTarget.value)}>
          {data.goals.map((goal) => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
        </select>
      </label>

      <div style={{ display: "grid", gap: "0.625rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Related issues ({data.related.length})</h2>
        {data.related.length === 0 ? <p style={{ opacity: 0.7 }}>No related issues yet.</p> : data.related.map((issue) => (
          <article key={issue.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", border: "1px solid currentColor", borderRadius: "0.5rem", padding: "0.75rem" }}>
            <IssueLink issue={issue}>
              <div><strong>{issue.identifier ?? issue.id.slice(0, 8)}</strong> {issue.title}</div>
              <small style={{ opacity: 0.7 }}>{issue.status} · {issue.relationship === "core" ? "Paperclip goal link" : issue.relationship === "both" ? "Paperclip + plugin link" : "Plugin link"}</small>
            </IssueLink>
            {issue.relationship === "plugin" || issue.relationship === "both" ? (
              <button type="button" disabled={pendingIssueId === issue.id} onClick={() => void mutate(unlinkIssue, issue.id)}>Unlink</button>
            ) : <small style={{ opacity: 0.7 }}>Core link</small>}
          </article>
        ))}
      </div>

      <div style={{ display: "grid", gap: "0.625rem" }}>
        <h2 style={{ margin: 0, fontSize: "1rem" }}>Add an issue</h2>
        <input value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search available issues" aria-label="Search available issues" />
        {available.slice(0, 50).map((issue) => (
          <article key={issue.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.5rem 0" }}>
            <IssueLink issue={issue}><strong>{issue.identifier ?? issue.id.slice(0, 8)}</strong> {issue.title}</IssueLink>
            <button type="button" disabled={pendingIssueId === issue.id} onClick={() => void mutate(linkIssue, issue.id)}>Link</button>
          </article>
        ))}
        {available.length === 0 && <p style={{ opacity: 0.7 }}>No matching unlinked issues.</p>}
      </div>
    </section>
  );
}

export function GoalIssuesPage({ context }: PluginPageProps) {
  return <GoalIssuesSurface context={context} />;
}

export function GoalIssuesDetailTab({ context }: PluginDetailTabProps) {
  return <GoalIssuesSurface context={context} />;
}
