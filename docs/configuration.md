# Configuring a private deployment

The public package starts with empty personal content, Analytics disabled and
optional system audio disabled. It runs locally without an account or API key.

## Analytics and consent

Set `ID` in `site/analytics-consent.js` to your own GA4 measurement ID only in your
configured deployment. A measurement ID is public configuration, not a secret;
the live owner's ID is intentionally absent from this template. The `_headers`
file allows the required Google connection endpoints on compatible hosts.

No Google script loads until the visitor explicitly chooses Allow analytics.
The automatic prompt waits for desktop login. About and Privacy provide a manual
preferences button, and the desktop exposes it through the hidden tray menu.
Choices persist in localStorage; declining after acceptance removes analytics
cookies and reloads the document without the tag. Cross-tab choice changes are
handled. Advertising consent stays denied; no User-ID is assigned.

The code sends sanitized page views and allowlisted app names, excluding query
strings, fragments and referrers. It does not send profile records, chat text or
contact messages. Disable enhanced measurement in the GA stream if you want only
these explicit events. Review your actual Google account settings and adapt
`site/privacy/index.html` to describe your deployment accurately.

Google Tag Assistant can verify the tag and consent states after acceptance.
An automatic installation scanner may inspect a page without accepting consent;
that result alone does not prove the consented tag is broken. Check actual sent
hits and Analytics Realtime as well.

## Public pages and search discovery

`/about/` and `/privacy/` use a playful blue-screen appearance; the desktop retains
Classic XP and its alternate appearance. Replace the generic About copy in a
private deployment. The Privacy page stays `noindex` by default.

Set your own origin in `sitemap.xml`, add its full URL to `robots.txt`, and configure
canonical URLs for your deployment. The sample sitemap uses `example.com` and
must be configured before production. Static hosts must serve directory index
pages. The included preview supports both `/about` and `/about/`.

The About navigation uses allowlisted `/#open=resume`, `/#open=achievements` and
`/#open=contact` destinations. It waits for the user tile rather than bypassing
login. Refresh starts a new logged-out desktop; preferences and consent remain.

## Audio

See [optional system sounds](../site/sounds/README.md). No supplied live-site
recordings are redistributed. Missing recordings do not affect the default
template because playback is disabled until configured.
