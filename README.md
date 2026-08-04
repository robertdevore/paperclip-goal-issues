# Goal Issues

Goal Issues is an external Paperclip plugin that adds a Related Issues tab to Paperclip's goal detail page. It shows issues linked to a goal through Paperclip's native `issues.goal_id` field and lets operators add extra plugin-owned links without changing the plugin's data model in Paperclip core.

## What it provides

- A `Related Issues` tab on the goal detail page.
- Goal selection, related-issue display, issue navigation, search, link, unlink, and refresh.
- Native goal links are shown automatically as `Paperclip goal link`.
- Extra relationships are stored in the plugin's isolated database namespace as `Plugin link`.
- A `detailTab` contribution for goals is declared for hosts that render goal detail slots.

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

The package snapshots the SDK and shared types from `/Users/robertdevore/2026/paperclip` for local development. Replace those file dependencies with published versions before publishing.
