# Goal Issues

Goal Issues is an external Paperclip plugin that adds a Related Issues tab to Paperclip's goal detail page and a Goals tab to each issue. It shows native Paperclip goal links and lets operators add extra plugin-owned links without changing Paperclip core.

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

## Install from npm

On a self-hosted Paperclip instance, install the published package with:

```bash
paperclipai plugin install @robertdevore/paperclip-goal-issues
```

The CLI installs the package from npm, validates its manifest, runs its database migration, and activates the plugin. Verify the installation with:

```bash
paperclipai plugin list
paperclipai plugin inspect robertdevore.paperclip-goal-issues
```

Then enable the experimental Goals surface in Paperclip settings and open a goal. The plugin contributes `Related Issues (N)` to the goal detail tabs. On an issue detail page, it contributes a `Goals` tab.

If you are asking a Hermes agent to install it, this is a sufficient instruction:

> Install the Paperclip plugin `@robertdevore/paperclip-goal-issues` with `paperclipai plugin install @robertdevore/paperclip-goal-issues`. After installation, verify that `robertdevore.paperclip-goal-issues` is ready and report any install or compatibility error.

The plugin requires a Paperclip host with goal detail plugin slots and the current plugin UI bridge. On hosts that do not support dynamic detail-tab badges, the Related Issues tab still works but its label will not include the live count. Older hosts without goal detail slots will install the package but cannot render the goal tab; the issue Goals tab uses the existing issue detail slot support.

To upgrade or remove it:

```bash
paperclipai plugin upgrade robertdevore.paperclip-goal-issues
paperclipai plugin uninstall robertdevore.paperclip-goal-issues
```

Uninstalling without a purge keeps plugin data available for a later reinstall. Use the Paperclip plugin uninstall option for a full data purge only when that is intentional.

## How it works

- Native `issues.goal_id` relationships appear as `Paperclip goal link` and cannot be removed by this plugin.
- Links created in either tab are stored in the plugin's isolated `goal_issues` namespace and appear as `Plugin link`.
- The same relationship is visible from both the goal page and the issue page.
- Navigation keeps the active company prefix, so links work for company-scoped URLs such as `/KUJ/goals/<goal-id>` and `/KUJ/issues/KUJ-83`.
- Until Paperclip exposes a first-class `goalId` issue-list filter, the plugin pages through visible company issues and filters native links in the worker. This is correct but less efficient for very large companies.

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

The local path above is for plugin development only. Published users should use the npm command in the previous section.

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
