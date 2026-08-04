import {
  useHostNavigation,
  usePluginAction,
  usePluginData,
  type PluginDetailTabProps,
} from "@paperclipai/plugin-sdk/ui";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Goal, Issue } from "@paperclipai/plugin-sdk";

type RelatedIssue = Issue & { relationship: "core" | "plugin" | "both" };
type GoalIssuesData = { goal: Goal; goals: Goal[]; related: RelatedIssue[]; available: Issue[] };

const panelStyle = {
  display: "grid",
  gap: "0.75rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  background: "var(--background)",
  overflow: "hidden",
} as const;

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "2rem",
  padding: "0.375rem 0.625rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  background: "var(--background)",
  color: "var(--foreground)",
  fontSize: "var(--text-micro)",
  fontWeight: 500,
  cursor: "pointer",
} as const;

const inputStyle = {
  width: "100%",
  minHeight: "2.25rem",
  padding: "0.5rem 0.625rem",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  background: "transparent",
  color: "var(--foreground)",
  fontSize: "var(--text-compact)",
  outline: "none",
  boxSizing: "border-box",
} as const;

function issueRef(issue: Issue): string {
  return issue.identifier ?? issue.id;
}

function IssueLink({ issue, children }: { issue: Issue; children: ReactNode }) {
  const navigation = useHostNavigation();
  return <a {...navigation.linkProps(`/issues/${encodeURIComponent(issueRef(issue))}`)} style={{ color: "inherit", textDecoration: "none" }}>{children}</a>;
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
    if (context.entityId) setGoalId(context.entityId);
  }, [context.entityId]);

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
          <h1 style={{ margin: 0, color: "var(--foreground)", fontSize: "var(--text-compact)", fontWeight: 600 }}>Related Issues</h1>
          <p style={{ margin: "0.25rem 0 0", color: "var(--muted-foreground)", fontSize: "var(--text-micro)" }}>Track the work that moves a goal forward.</p>
        </div>
        <button type="button" style={buttonStyle} onClick={() => void refresh()}>Refresh</button>
      </header>

      <div style={{ display: "grid", gap: "0.625rem" }}>
        <h2 style={{ margin: 0, color: "var(--foreground)", fontSize: "var(--text-compact)", fontWeight: 600 }}>Related issues ({data.related.length})</h2>
        {data.related.length === 0 ? <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-micro)" }}>No related issues yet.</p> : (
          <div style={panelStyle}>
            {data.related.map((issue) => (
              <article key={issue.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.625rem 0.75rem", borderBottom: "1px solid var(--border)" }}>
                <IssueLink issue={issue}>
                  <div style={{ color: "var(--foreground)", fontSize: "var(--text-compact)" }}><strong style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "var(--text-micro)" }}>{issue.identifier ?? issue.id.slice(0, 8)}</strong> {issue.title}</div>
                  <small style={{ color: "var(--muted-foreground)", fontSize: "var(--text-micro)" }}>{issue.status} · {issue.relationship === "core" ? "Paperclip goal link" : issue.relationship === "both" ? "Paperclip + plugin link" : "Plugin link"}</small>
                </IssueLink>
                {issue.relationship === "plugin" || issue.relationship === "both" ? (
                  <button type="button" style={buttonStyle} disabled={pendingIssueId === issue.id} onClick={() => void mutate(unlinkIssue, issue.id)}>Unlink</button>
                ) : <small style={{ color: "var(--muted-foreground)", fontSize: "var(--text-micro)" }}>Core link</small>}
              </article>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gap: "0.625rem" }}>
        <h2 style={{ margin: 0, color: "var(--foreground)", fontSize: "var(--text-compact)", fontWeight: 600 }}>Add an issue</h2>
        <input style={inputStyle} value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Search available issues" aria-label="Search available issues" />
        {available.length > 0 ? (
          <div style={panelStyle}>
            {available.slice(0, 50).map((issue) => (
              <article key={issue.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "0.625rem 0.75rem", borderBottom: "1px solid var(--border)" }}>
                <IssueLink issue={issue}><span style={{ color: "var(--foreground)", fontSize: "var(--text-compact)" }}><strong style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "var(--text-micro)" }}>{issue.identifier ?? issue.id.slice(0, 8)}</strong> {issue.title}</span></IssueLink>
                <button type="button" style={buttonStyle} disabled={pendingIssueId === issue.id} onClick={() => void mutate(linkIssue, issue.id)}>Link</button>
              </article>
            ))}
          </div>
        ) : <p style={{ color: "var(--muted-foreground)", fontSize: "var(--text-micro)" }}>No matching unlinked issues.</p>}
      </div>
    </section>
  );
}

export function GoalIssuesDetailTab({ context }: PluginDetailTabProps) {
  return <GoalIssuesSurface context={context} />;
}

export function GoalIssuesTabBadge({ context }: PluginDetailTabProps) {
  const { data, loading } = usePluginData<GoalIssuesData>("goal-issues", {
    companyId: context.companyId,
    goalId: context.entityId,
  });

  if (loading && !data) return <span aria-label="Loading related issue count">(…)</span>;
  return <span aria-label={`${data?.related.length ?? 0} related issues`}>({data?.related.length ?? 0})</span>;
}
