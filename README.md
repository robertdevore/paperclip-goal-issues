# Goal Issues for Paperclip

Connect Paperclip goals and issues: a **Related Issues** tab on goals, a **Goals** tab on issues, and plugin-owned relationships that do not modify Paperclip core data.

This is a ready-to-install Paperclip plugin.

- npm: [`@robertdevore/paperclip-goal-issues`](https://www.npmjs.com/package/@robertdevore/paperclip-goal-issues)
- Source and releases: [github.com/robertdevore/paperclip-goal-issues](https://github.com/robertdevore/paperclip-goal-issues)
- Current package version: `v0.1.1`

## Install the published plugin

Install it into a self-hosted Paperclip instance with the Paperclip CLI or Plugin Manager:

```bash
paperclipai plugin install @robertdevore/paperclip-goal-issues
paperclipai plugin inspect robertdevore.paperclip-goal-issues
```

The inspection should report `status=ready`. Enable the experimental **Goals** surface in Paperclip settings, then reload Paperclip if necessary. You will see **Related Issues (N)** on goal detail pages and **Goals** on issue detail pages.

If you are asking a Hermes agent to install it, use:

> Install `@robertdevore/paperclip-goal-issues` with `paperclipai plugin install @robertdevore/paperclip-goal-issues`. Verify that `robertdevore.paperclip-goal-issues` reports `status=ready`, and report any compatibility or installation error.

## Requirements

- Paperclip with external plugin support.
- Node.js 20 or newer on the Paperclip host.
- The experimental Paperclip Goals surface enabled.

### Current Paperclip compatibility status

The issue Goals tab uses Paperclip's existing issue detail extension point. The Related Issues tab requires a Paperclip host that renders `detailTab` contributions on goal detail pages. Hosts without that goal slot can install the plugin, but cannot render the goal tab until the host capability is available.

Dynamic `(N)` tab counts require the host's dynamic detail-tab badge support. Without it, the Related Issues tab still works but displays without the live count.

The plugin SDK does not yet expose a first-class `goalId` filter for issue reads. Until that is added, the worker pages through visible company issues and filters native goal links itself. This is correct but less efficient for very large companies. See [CORE_REQUIREMENTS.md](./CORE_REQUIREMENTS.md) for the remaining Paperclip-team requests.

## How it works

- Open a goal and select **Related Issues (N)**.
- Search by issue identifier or title, then select **Link**.
- Open an issue and select **Goals**.
- Search by goal title, then select **Link**.
- The same relationship is visible from both the goal and issue pages.
- Company-scoped navigation preserves URLs such as `/KUJ/goals/<goal-id>` and `/KUJ/issues/KUJ-83`.

The plugin distinguishes two relationship types:

- **Paperclip goal link** — the native `issues.goal_id` relationship. It is read by the plugin and cannot be removed from the plugin UI.
- **Plugin link** — an additional relationship stored in the plugin's isolated `goal_issues` database namespace. It can be removed with **Unlink**.

The plugin does not add a sidebar page or change Paperclip's core issue or goal schema.

## Upgrade or uninstall

```bash
paperclipai plugin upgrade robertdevore.paperclip-goal-issues
paperclipai plugin uninstall robertdevore.paperclip-goal-issues
```

Uninstalling without a purge keeps plugin data available for a later reinstall. Use the plugin manager's purge option only when deleting the stored relationships is intentional.

## Local development

Clone the public repository when developing or testing changes locally:

```bash
git clone https://github.com/robertdevore/paperclip-goal-issues.git
cd paperclip-goal-issues
pnpm install
pnpm typecheck
pnpm test
pnpm build
paperclipai plugin install "$PWD"
pnpm dev
```

Paperclip watches the local plugin's built `dist/` files while `pnpm dev` is running. The repository uses the published `@paperclipai/plugin-sdk`, so a fresh clone does not require a local Paperclip checkout or an ignored SDK snapshot.

## Release maintenance

The npm package and GitHub repository are public. Maintainers can publish a new release with:

```bash
npm login --auth-type=web
npm whoami
npm version patch   # or minor / major
pnpm typecheck
pnpm test
pnpm build
npm pack --dry-run
git push origin master --follow-tags
npm publish --access public
```

Verify the published package and installation:

```bash
npm view @robertdevore/paperclip-goal-issues version
paperclipai plugin install @robertdevore/paperclip-goal-issues
paperclipai plugin inspect robertdevore.paperclip-goal-issues
```

If `npm whoami` returns `E401`, authenticate before publishing. The registry may report a misleading `E404` when the account is not authenticated or does not own the `@robertdevore` scope.

The package tarball contains only the built plugin, migration, README, license, and package metadata. Source, tests, development SDK snapshots, and lockfiles are not included.

## License

MIT
