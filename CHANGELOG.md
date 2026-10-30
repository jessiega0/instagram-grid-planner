# Changelog

All notable changes to this project. Versions follow major.minor.patch.

## 1.1.0 (30 October 2026)

### Added

- In-app update check: on open, the planner reads `version.json` from this repo and shows a dismissible "Update available" banner with the release notes.
- Banner buttons: "View on GitHub" and "Copy update prompt for my agent".
- Settings: "Check for updates on open" toggle, a "Check now" button, and the current version number.
- `SETUP.md` section "For agents: checking for updates": the agent asks the user first, backs up the folder, replaces only the files listed in `version.json`, and never touches exports, images or `.env`.
- `version.json` release file and a maintainer note in `README.md` on releasing updates.

### Privacy

- The update check sends no settings, credentials, plans, cookies or referrer, times out after 5 seconds, and never downloads or replaces files by itself.

## 1.0.0 (30 October 2026)

- First versioned release. The update-check implementation was initially labelled 1.0.0 before its release number was corrected to 1.1.0.

## 0 (25 October 2026)

- First public release: grid planner, Instagram feed sync, local relay (`server.mjs`) for webhook CORS, and Meta app setup guide.
- Connection-risk acknowledgement required before setup.
