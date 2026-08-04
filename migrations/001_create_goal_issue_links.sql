CREATE TABLE plugin_goal_issues_d0071f248b.goal_issue_links (
  company_id uuid NOT NULL,
  goal_id uuid NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  issue_id uuid NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (goal_id, issue_id)
);

CREATE INDEX goal_issue_links_company_goal_idx
  ON plugin_goal_issues_d0071f248b.goal_issue_links (company_id, goal_id, created_at DESC);
