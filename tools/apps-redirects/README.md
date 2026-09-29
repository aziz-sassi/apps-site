# apps-redirects

A redirect-only Vercel project. It exists so the App Store's outbound links
reach this site instead of dying on orphaned preview deployments.

## Why

Apple's listings for two apps pointed at old `.vercel.app` previews that never
mentioned appsbysass.com. That meant apple.com — one of the highest-authority
domains Google crawls — was endorsing pages that competed with ours on the same
apps, while this site had no inbound links at all.

Moving those two hostnames onto permanent redirects transfers that signal here.

## What it covers

| Hostname (linked from the App Store) | Redirects to |
|---|---|
| `jupiterapp-dog.vercel.app` | `https://www.appsbysass.com/jupiter-walkies/` |
| `bo-flax.vercel.app` | `https://www.appsbysass.com/bo/` |

Both are 308 (permanent), which passes ranking signals. Verified reaching the
right page as Googlebot.

## What it deliberately does NOT cover

- **HOLD** — its App Store URL is `holdapp.lovable.app/support`, hosted on
  Lovable, not Vercel. Unreachable from here.
- **The Bali Secret** — its URL is `baliwise-web.vercel.app/support`. That
  hostname is ours, but the project has no git connection and no local source,
  so a path-only redirect cannot be deployed. The only available lever is
  moving the whole hostname, which would take the live BaliWise site down.
  Not done, deliberately.

For both, the better fix is App Store Connect → App Information → **Marketing
URL** → the app's page on this site. That field is editable without submitting
a build, and it leaves the Support URLs pointing at real support pages, which
is what Apple expects them to do.

## Deploying / changing it

```bash
cd tools/apps-redirects
vercel deploy --prod --yes --name apps-redirects --scope azizsassis-projects
vercel alias set <new-deployment-host> jupiterapp-dog.vercel.app --scope azizsassis-projects
vercel alias set <new-deployment-host> bo-flax.vercel.app        --scope azizsassis-projects
```

Note: this project must have **Vercel Authentication disabled**, or the
`.vercel.app` hostnames get gated behind an SSO login and the redirect never
fires. It holds nothing but redirects, so there is nothing to protect.

## Undoing it

Point the two aliases back at the production deployments of the original
`jupiterapp` and `bo` projects. Those projects were never touched.
