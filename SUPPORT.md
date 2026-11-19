# Support

Reviewed November 18, 2026.

- For reproducible defects, use the Bug report issue template.
- For proposed improvements, use the Feature request issue template.
- For private matters, permissions or project enquiries, use Contact Me at
  https://nzjosh.com/. Do not post personal details in public issues.
- For vulnerabilities, follow SECURITY.md.

Include the site/release version, browser, device, reproduction steps and whether
the problem occurs in your local public template or the live site. Remove private
information from screenshots and logs. Never attach a personal site export.

This is a personal project with no guaranteed support or response time. The public
template deliberately omits profile data, photos, certificates and resume files;
empty personal-content windows are expected.

## Local preview troubleshooting

Run commands from the repository root with Node.js 22 or newer. Use `npm run check` for syntax and privacy checks, `npm run test:local` for actual loopback HTTP and asset checks, and `npm start` to serve the interface. Open the printed HTTP address; opening index.html directly will not load ES modules correctly.

If port 4173 is occupied, stop your previous preview or choose a different port. In PowerShell use `$env:PORT=4174; npm start`; on macOS/Linux use `PORT=4174 npm start`. A firewall or execution sandbox may block loopback access; do not disable security protections. Run the preview in your ordinary trusted local development environment instead.

An empty biography, photo collection, resume or credential list is expected in this public template. The live website has a separate private content source. Local smoke checks verify file serving, not every visual interaction or browser compatibility.
