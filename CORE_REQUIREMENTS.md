# Paperclip core requirements

These are the only core capabilities needed to make this plugin feel native. The plugin is usable without them through its company sidebar page.

## 1. Render goal detail plugin slots

The SDK and manifest schema already support `detailTab` slots with `entityTypes: ["goal"]`, but the current `GoalDetail` page does not render a plugin slot outlet. Paperclip should render the standard detail-tab outlet in the goal detail layout and pass the active company ID, company prefix, goal ID, and entity type.

Suggested contract:

```tsx
<PluginSlotOutlet
  slotTypes={["detailTab"]}
  context={{
    companyId: resolvedCompanyId,
    companyPrefix,
    entityId: goal.id,
    entityType: "goal",
  }}
/>
```

The exact placement can follow the existing issue/project detail slot conventions.

## 2. Expose a goal filter to plugin issue reads

The worker issue client can list issues by company, project, assignee, status, origin, and other fields, but not by `goalId`. Add an optional `goalId` to the plugin `ctx.issues.list()` contract and forward it through the worker RPC and host issue service. This lets plugins query one goal efficiently instead of paging through every visible issue and filtering in the plugin worker.

The matching UI `IssuesListFilters` and host bridge filter should also accept `goalId` if the host intends plugins to reuse the native issue list component.

## Current plugin workaround

Until those capabilities exist, this plugin:

- reads native `issue.goalId` values by paging the company issue list;
- stores additional relationships in its isolated plugin database namespace;
- exposes the complete workflow from `/goal-issues` under the company sidebar;
- declares the goal detail slot so it will render automatically once the host mounts that slot.
