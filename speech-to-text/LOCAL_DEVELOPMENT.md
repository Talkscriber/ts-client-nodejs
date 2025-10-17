# Local Development Guide (using local .tgz package)

This guide explains how to build, pack, install, and run the UI example against the locally built package without any bundler.

## 1) Build the TypeScript (core + browser)

```bash
cd speech-to-text
npm run build
```

## 2) Create the package

```bash
npm pack
# Creates: talkscriber-npm-ts-client-1.0.11.tgz
```

## 3) Install the local package in node_modules

```bash
npm install ./talkscriber-npm-ts-client-1.0.11.tgz
```

## 4) Build the UI example

```bash
npm run build:ui
```

## 5) Run the dev server

```bash
npm run dev:ui
```

Then open:
- http://127.0.0.1:8320/examples/ui/

## Notes
- The dev server serves the repository root, so the browser can load the package directly from `node_modules/@talkscriber-npm/ts-client/dist/index.browser.js` (no bundler/CDN required).
- The example UI script exposes `TalkscriberBrowserTranscriptionService` to `window` by importing the module from local `node_modules` in `examples/ui/index.html`.
- To confirm you are using the local package, open DevTools → Network and verify a request to:
  - `/node_modules/@talkscriber-npm/ts-client/dist/index.browser.js`
- If you update the source, re-run:
  - `npm run build`, then `npm pack`, then reinstall the tarball, and `npm run build:ui` again.
