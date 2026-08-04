# Goal Issues

Goal Issues is an external Paperclip plugin that adds a Related Issues tab to Paperclip's goal detail page. It shows issues linked to a goal through Paperclip's native `issues.goal_id` field and lets operators add extra plugin-owned links without changing the plugin's data model in Paperclip core.

## What it provides

- A `Related Issues` tab on the goal detail page.
- A `Goals` tab on the issue detail page for attaching the issue to one or more goals.
- Goal selection, related-issue display, issue navigation, search, link, unlink, and refresh.
- Native goal links are shown automatically as `Paperclip goal link`.
- Extra relationships are stored in the plugin's isolated database namespace as `Plugin link`.
- A `detailTab` contribution for goals is declared for hosts that render goal detail slots.
- A second `detailTab` contribution targets issue detail slots, which Paperclip already renders on issue pages.
- The tab label includes a live `(N)` count from the same goal-scoped data used by the tab.

The Paperclip core branch now mounts goal `detailTab` contributions in the experimental Goals surface. This plugin therefore appears at URLs such as `/:companyPrefix/goals/:goalId` rather than adding another sidebar item.

The current plugin issue-list SDK contract also has no `goalId` filter. The worker paginates the company issue list and filters native `goalId` values in the plugin process. For very large companies, a first-class plugin-readable goal filter or a goal detail slot would remove this limitation.

See [CORE_REQUIREMENTS.md](./CORE_REQUIREMENTS.md) for the remaining Paperclip-team request list.

## Development

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Install locally into Paperclip with:

```bash
paperclipai plugin install /Users/robertdevore/2026/paperclip-goal-issues
```

## Add an issue to a goal

1. Open a goal at `/:companyPrefix/goals/:goalId`.
2. Select `Related Issues (N)`.
3. In `Add an issue`, search by issue identifier or title.
4. Click `Link` beside the issue.
5. Confirm it moved into `Related issues` and shows `Plugin link`.

Native Paperclip goal links show as `Paperclip goal link` and cannot be removed by this plugin. Plugin-owned links can be removed with `Unlink`.

## Add a goal from an issue

1. Open an issue, such as `/KUJ/issues/KUJ-83`.
2. Select the plugin's `Goals` tab.
3. Under `Add to a goal`, search by goal title.
4. Click `Link` beside the goal.
5. Confirm it appears under `Related goals` and shows `Plugin link`.

The package snapshots the SDK and shared types from `/Users/robertdevore/2026/paperclip` for local development. Replace those file dependencies with published versions before publishing.
