# Instagram planner

New here, or an AI agent setting this up? Start with SETUP.md.

**Version 1.1.0 — released 30 October 2026.** Added optional in-app update checks and agent-assisted update instructions.

See [CHANGELOG.md](CHANGELOG.md) for what changed in each version.

## Before you start: connection risks

The planner now asks you to read and explicitly acknowledge these risks before entering the planner. The checkbox starts unchecked; tick it and choose **Agree and enable** to continue. An Instagram API token is required for live sync. If you do not agree, close the page. You can revisit the notice through **Settings → Review connection risks**. Agreement is remembered locally for this notice version; it is not sent anywhere and is not a security guarantee.

- Keys are stored **unencrypted in localStorage**. Password fields mask the display only. Browser-profile access, sufficiently privileged extensions, or malicious code running on the same origin can expose them.
- Tokens and keys are transmitted to the intended services when used: Instagram receives the Instagram token; the configured webhook receives its key. The local relay handles the webhook key in memory.
- Instagram tokens appear in API request URLs, and upstream errors may echo sensitive information. Redact screenshots, network captures, HAR files and error messages before sharing.
- Uploaded Cloudinary JPEGs have accessible URLs. Protect and restrict the unsigned upload preset, monitor quota and manage hosted-image deletion yourself.
- Use a trusted local copy. Never enter keys into an unfamiliar hosted or modified copy. Backups contain photos and plans. **Clear saved keys** removes local connection settings but does not revoke keys at their providers.
- Require approval in the receiving agent before publishing. The planner cannot enforce the receiver's approval process.

## Report a bug

Bug reports are welcome: open this repository's **Issues** tab and choose **New issue**. Include the version shown in Settings, your browser and operating system, steps to reproduce, expected behaviour, and what actually happened. Screenshots and error messages help, but remove tokens, webhook keys, private URLs, account details and personal photos before posting. Issues are public. Never attach an exported plan or browser storage dump.

This folder is the complete public distribution. Share only these seven files:

- `planner.html`
- `server.mjs`
- `README.md`
- `SETUP.md`
- `CHANGELOG.md`
- `.gitignore`
- `version.json`

No installation, build step, external libraries, personal posts, or credentials are bundled. Download the folder and open `planner.html` in a modern browser. Six editable grey placeholders start each account's plan; replace or remove them before sending. Published posts are locked. Plans, tags, captions, carousel images, hiding, crop previews, theme, and ordering are saved in this browser's IndexedDB. Exported backups contain your photos and plans, so keep them private.

## Connections

Open Settings and enter your own Instagram token for Account 1 and/or Account 2. All fields start blank. The account name is resolved from Instagram on refresh. Use an Instagram professional account and a token with the appropriate media-reading permissions. Refresh loads the newest posts; scrolling loads additional pages. A missing or expired token displays an error. Account slots remain separate.

Enter your webhook URL, webhook key, Cloudinary cloud name and unsigned upload preset. Folder is optional. Configure the preset in your own Cloudinary account to accept images. Credentials are stored only in this page's localStorage, never embedded in the HTML or included in exported plan backups. LocalStorage is not encrypted. **Clear saved keys** removes all saved connection settings and clears the form; it does not revoke credentials at their providers or delete drafts. Browser profiles and file/HTTP origins have separate storage.

## Sending

The button sends visible, unsent planned posts; hidden, published and previously dispatched posts are excluded. Remove or replace grey placeholders first. Captions are limited to 2,200 characters and 30 hashtags, and carousels to 10 images. Each original is converted to JPEG at quality 0.92, at most 1080 pixels wide, preserving its aspect ratio without upscaling. Crop/zoom is a grid preview only. Originals stay local; only the converted JPEG is uploaded. The response's secure image URL and public ID are included in the webhook payload, with per-image normalized photo tags when present. Uploaded Cloudinary images are accessible via their URLs; configure retention/deletion in your own account.

The webhook receives a JSON plan with `plan_id`, `account`, and ordered `posts` containing `position`, `type`, `caption`, and `images`. Each image contains `filename`, `mime`, `url`, `public_id`, and optional `user_tags`. Authentication uses a Bearer header built from the key entered in Settings. Array order follows grid position. Your agent must handle publishing order correctly (new posts appear at the front of an Instagram feed) and request approval before publishing. The planner does not publish directly.

Dispatch is marked before the request. If delivery is uncertain, check your agent before enabling a retry to avoid duplicates. Uploads completed before a failure may remain in Cloudinary.

## CORS and the optional local relay

Direct file opening supports planning. Live API requests and uploads require internet access and provider CORS support. Webhooks must allow the page origin, POST, Content-Type and Authorization. Browsers sometimes use the `null` origin for local files. A fetch failure alone cannot prove CORS: the app preserves the error text and explains possible CORS/network causes.

If the webhook blocks browser requests, use the included relay with Node.js 20 or newer. In PowerShell, inside this folder:

```powershell
$env:PLANNER_WEBHOOK_URL = 'https://your-webhook.example/receive'
node server.mjs
```

Open `http://127.0.0.1:4320/planner.html`, then enter the same webhook URL and your keys in Settings. The URL environment variable approves the destination; it is not a key. No keys belong in this command or source files. The relay binds only to loopback, requires a matching origin, accepts only the approved HTTPS destination, rejects redirects, limits requests to 1 MB and times out after 30 seconds. Keys pass through server memory only and are never saved or logged. This keeps the same-origin CORS workaround without bundling any provider-specific destination. Do not expose this server to a network. On another HTTP server, `/api/agent` must implement the equivalent relay.

## Icon and sharing

By default the button says **Send to agent** and uses a neutral bot icon for Codex, Claude, or another agent. In Settings, choose **Grok** under Publishing agent to switch to **Send to Grok** with the monochrome round mark. This only changes the button branding, not your configured webhook or payload. Clearing saved keys also resets this preference.

Both marks are inline SVG in the single `AGENT_ICON_SVG` constant at the top of the script. Change its SVG strings to swap them. Neither has an external image dependency.

Initialize or publish a repository **inside this folder only**. Do not publish a parent workspace: it may contain unrelated private files. The ignore file excludes JSON (except the public `version.json`), export/image directories, `.env` and `.DS_Store`; it is not a credential scanner and does not remove files already tracked by Git. Review `git status` and staged diffs before every commit. Never add your keys, downloaded photos, exports, or backups to source control.

## Checking for updates

On open, the planner checks public release metadata on GitHub with a five-second timeout. Settings has **Check for updates on open** (on by default) and **Check now**. The request contains no keys, plans or custom headers; cookies and referrer are omitted. GitHub still receives ordinary connection metadata such as your IP address. Offline/network errors are silent. A newer release shows notes, a GitHub link and a copyable agent prompt. Dismissal applies only to that version. Nothing is downloaded, replaced or reloaded automatically beyond the version metadata.

See [For agents: checking for updates](SETUP.md#for-agents-checking-for-updates) for the approval and backup procedure.

## Releasing an update (maintainer)

Bump APP_VERSION in planner.html and version.json together, update the release date and notes, and add a new entry to the top of CHANGELOG.md. Review the files list, then push. Keep the version in this README and SETUP current. Never include user data in release files.
