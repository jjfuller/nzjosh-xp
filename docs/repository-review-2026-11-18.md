# Repository review — November 18, 2026

Website version: **2026.11.18.20**. This review updates the public template and its documentation; it does not deploy changes to nzjosh.com.

## Reviewed scope

- README, architecture, support, contributing, security, accessibility, code of conduct and GitHub issue/PR templates were checked for consistency with the current folder navigation and blank-content template.
- The original-code MIT License remains unchanged: copyright 2026 Joshua Fuller. Third-party artwork, fonts, photographs and trademarks retain separate rights; the existing notices do not establish missing redistribution permissions. No new license grants are claimed.
- Asset credits, icon provenance and third-party notices were reviewed and retain their scope. Historical release notes remain historical, rather than being rewritten with today's date.
- All public JavaScript modules received syntax checks; local imports, JSON, documentation links and the personal-content boundary were checked. This is a scoped maintenance review, not an independent security or accessibility certification.

## Changes

- Full, uncropped Classic and Papaya overview captures include the taskbar and screen edges. Each capture followed three seconds without pointer or application movement.
- The car illustration shows the bottom quarter so the taskbar racer is visible. The requested chat screenshot and NAS README section were removed.
- The local server no longer contains an obsolete personal resume-download filename. Its path boundary uses a relative-path check and its port can be selected with `PORT`.
- `npm run test:local` exercises the actual local server and compares every served public file against disk, plus home, JavaScript MIME, 404 and encoded path-boundary checks.
- Support and contribution instructions explain the commands, loopback restrictions, occupied ports and expected empty personal-content views. The responsive icon placement fix remains covered by nine desktop/mobile layout cases.

## Validation performed

- `npm run check`: 35 JavaScript modules passed; blank profile, credential collections and local imports verified.
- `npm run test:local`: 136 public files matched disk through HTTP; route and path-boundary checks passed.
- Browser smoke check on the local public template: welcome/login, desktop, My Computer, Certificates, Back navigation and empty Pictures worked; no console errors were observed during those checks.
- Personal uploads, biography and contact records, resume documents, credential IDs, account URLs and secrets remain excluded. The approved Josh Bot cartoon remains documentation artwork.

The local HTTP checks required loopback network permission in the maintenance environment. They do not contact external APIs. Browser smoke checks cover the observed Chromium session; Firefox, Safari, Edge and assistive-technology regression testing were not repeated for this documentation/server update.

## Final nightly update

Reviewed the blue-screen pages, opt-in consent integration, refresh logout, tray accessibility and optional audio integration. The template measurement ID stays blank, personal-content collections remain empty and sound recordings are excluded. Directory-style About/Privacy routes passed local HTTP checks. Historical screenshots are retained where the interface is unchanged; new blue-screen captures use the sanitized local template.
