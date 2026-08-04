# Goal Issues

Goal Issues is an external Paperclip plugin that adds a company-scoped Goal Issues page. It shows issues linked to a goal through Paperclip's native `issues.goal_id` field and lets operators add extra plugin-owned links without changing Paperclip core.

## What it provides

- A `Goal Issues` company sidebar entry and page at `/goal-issues`.
- Goal selection, related-issue display, issue navigation, search, link, unlink, and refresh.
- Native goal links are shown automatically as `Paperclip goal link`.
- Extra relationships are stored in the plugin's isolated database namespace as `Plugin link`.
- A `detailTab` contribution for goals is declared for hosts that render goal detail slots.

## Current host limitation

The current Paperclip `GoalDetail` page does not render the plugin `detailTab` slot, even though the SDK and manifest contract support `entityTypes: ["goal"]`. Therefore the plugin cannot currently place its panel directly inside the core goal page without a Paperclip core change. The sidebar page is the complete usable fallback and keeps all plugin behavior outside core.

The current plugin issue-list SDK contract also has no `goalId` filter. The worker paginates the company issue list and filters native `goalId` values in the plugin process. For very large companies, a first-class plugin-readable goal filter or a goal detail slot would remove this limitation.

See [CORE_REQUIREMENTS.md](./CORE_REQUIREMENTS.md) for the concise Paperclip-team request list.

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
