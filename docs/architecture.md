# Code walkthrough

NZJOSH XP uses HTML, CSS and JavaScript ES modules. The desktop is a browser UI,
not an operating system, remote desktop or shell with access to the visitor's files.

## Entry points and window management

`site/index.html` boots `desktop.js`, which loads the public profile, builds the
desktop and menus, and manages application windows, focus, stacking and taskbar
buttons. `programs.js` supplies the app catalogue and render dispatch. Feature
modules return cleanup functions where they install window-specific handlers.

`desktop-selection.js` handles icon selection and rearrangement. Its rubber band
starts from empty desktop space so icon opening and window interaction remain
separate. `desktop-performance.js` and `desktop-cleanup.js` preserve the existing
startup optimisations and retired-control cleanup.

## Explorer and documents

| Module | Responsibility |
| --- | --- |
| `my-computer.js` | Folder shell, sidebar routes and embedded folder views |
| `computer-shortcut.js` | My Computer desktop shortcut |
| `explorer-path.js` | Address-bar breadcrumb navigation |
| `xp-icon-refresh.js` / `.css` | Current window, desktop and navigation icon styling |
| `gallery-explorer.js` | Album folders, rotating cover, thumbnail selection and photo controls |
| `certificates.js` | Grouped credential folders and thumbnail interactions; personal records removed here |
| `document-viewer.js` | Shared document window, image/PDF presentation, zoom, download and print |

Mouse folder selection and double-click opening follow the desktop metaphor.
Touch/pen and coarse-pointer paths support direct opening. Menus and thumbnail
controls also provide keyboard paths. These interactions should be checked when
changing a renderer, since views can run inside My Computer as well as standalone.

## Appearance and racing

`race-theme.js` recognises `papaya` and `classic` in the simulated Command Prompt.
It starts the five-light sequence and prepares `race-circuit.js` asynchronously.
The five-second sequence is a presentation timer, not a network progress meter.
Reduced motion skips the countdown. Refresh, page leave/return and tab visibility
changes reset the appearance to Classic; Papaya is no longer restored from storage.

`race-theme.css` supplies the Papaya/charcoal palette and scoped contrast fixes,
including readable Display Properties labels on its light panel. `race-timing.js`
presents decorative simulation results; no real motorsport telemetry is fetched.
`desktop-racer.js` and `.css` implement the independent taskbar car and wheel motion.
The newer racer derives pass duration from viewport travel distance and target
speed, clamps fast passes to 0.9–2.8 seconds, and preserves position when resizing.
Wheel rotation follows the distance travelled instead of an unrelated timer.

## Photos versus documents

`picture-protection.js` installs scoped context-menu, drag and shortcut deterrents.
`protectPictures()` marks personal picture renderers and disables image dragging;
the matching CSS hides these photo views in print media. It does not disable
certificate or resume document controls.

This cannot secure a publicly delivered image against screenshots, direct requests,
browser tools or disabled JavaScript. Keep images private rather than serving them
if access must actually be restricted. No private albums are shipped in this template.

## Josh Bot

`programs.js` lazy-loads `joshbot-chat.js` when the chat opens. Prepared entries in
`joshbot-faq.json` are selected by token matching in `joshbot-local.js`. There is no
LLM, inference server, API key or conversation-training pipeline. Fallback text
handles low-confidence matches and unavailable local data.

`joshbot-messages.js` provides a bounded session log and whitelisted window actions.
`joshbot-notifications.js` schedules editable prompts, applies interruption guards,
and honours notification and mute preferences. Public FAQ entries stay generic.

## Software logos and attribution

`software-logos.js` records asset filenames and provenance. Its locally hosted files
are under `site/software-logos/`; no visitor requests to a logo proxy are required.
`legal-notices.js` renders their source/rights entries in About this desktop.
The Recently Used menu represents the owner's software toolkit, not collected
visitor usage. Vendor marks remain subject to their owners' rights.

## Public-content boundary

The live Worker overlays selected assets on a static-assets binding. Its complete
source embeds personal records and must not be copied into this repository. This
public package instead contains the updated client modules, an empty `profile.json`,
generic bot answers and empty certificate/award/course records. It omits the
`uploads/` directory, private editor tools, deployment tokens and personal PDFs.
The approved Josh Bot cartoon is a documentation image, not a photographic portrait.

`npm run check` verifies syntax, local module references and key publication
boundaries. Human review is still required for new images, prose, asset permissions,
screenshots and any new hardcoded personal data. The MIT License covers original
code/documentation; third-party asset rights are described separately.
