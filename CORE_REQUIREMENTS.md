# Paperclip core requirements

These are the remaining core capabilities needed to make this plugin scale well. The goal detail surface is now implemented on the Paperclip development branch.

## 1. Render goal detail plugin slots — implemented

The Paperclip development branch now renders goal `detailTab` contributions in the Goals detail page and passes the active company ID, company prefix, goal ID, and entity type.

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

## Current plugin behavior

Until the `goalId` issue filter exists, this plugin:

- reads native `issue.goalId` values by paging the company issue list;
- stores additional relationships in its isolated plugin database namespace;
- exposes the complete workflow from the goal detail page's `Related Issues` tab;
- stores extra relationships in the plugin namespace while preserving native `issue.goalId` links.
