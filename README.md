# PriceHawk 🦅

A learn-and-earn browser extension starter: tracks prices on Amazon product
pages, alerts you on price drops, and applies your Amazon Associates
affiliate tag automatically when you click through to buy.

Built with **TypeScript + React + Vite + CRXJS**, targeting Manifest V3
(works on Edge, Chrome, and other Chromium browsers with zero code changes).

## Project structure

```
pricehawk-extension/
├── manifest.json          # Extension manifest (permissions, entry points)
├── vite.config.ts         # Vite + CRXJS build config
├── src/
│   ├── background.ts      # Service worker — shows price-drop notifications
│   ├── content.ts         # Runs on Amazon product pages, scrapes price
│   ├── types.ts           # Shared TypeScript types
│   ├── utils/
│   │   └── affiliate.ts   # Affiliate tag storage + link building
│   └── popup/
│       ├── popup.html     # Popup entry HTML
│       ├── main.tsx       # React root mount
│       └── Popup.tsx      # Popup UI — tracked product list
└── public/icons/          # Placeholder extension icons (swap these out)
```

## Setup

```bash
npm install
npm run build       # one-off production build -> dist/
npm run dev         # watch mode while you develop
```

## Load it into Edge (or Chrome)

1. Run `npm run build`.
2. Go to `edge://extensions` (or `chrome://extensions`).
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select the `dist/` folder.
5. Visit any `amazon.com` product page (a `/dp/PRODUCTID` URL) — PriceHawk
   starts tracking it automatically.
6. Click the extension icon to see tracked products and set your
   Amazon Associates tag.

## Getting your affiliate tag

1. Apply at https://affiliate-program.amazon.com (free).
2. Amazon typically wants a live "channel" (site, blog, or app) with some
   original content before approving you — a simple free GitHub Pages site
   describing PriceHawk works fine for this.
3. Once approved, copy your tag (looks like `yourname-20`) and paste it
   into the popup — it's stored locally via `chrome.storage.sync` and never
   hard-coded into the bundle.

## Where to take this next

- Swap the DOM-scraping price reader in `content.ts` for a more robust
  parser, or add support for other retailers (Walmart, Best Buy, etc.).
- Replace the placeholder icons in `public/icons/` with real artwork.
- Add a background `chrome.alarms` job to re-check saved products even when
  the user isn't currently on that page (needs a backend or scraping
  service, since a content script only runs on pages you visit).
- Add a "share this deal" button that copies the affiliate link.
