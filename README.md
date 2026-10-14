# Lokkhi Pakhi's Routine — mobile planner prototype

This is a separate, installable web app/PWA built from a **read-only extraction** of the uploaded `Lokkhi Pakhi's Routine.xlsx` workbook. It does not connect to, edit, or overwrite the original Google Sheet or Excel workbook.

## What's included

- **Month:** August, September, and October 2026 dates, task labels, and imported checkbox states. Checkboxes you change in the app are saved locally in the browser on that device.
- **Setup:** weekly schedule times and task labels from the `SETUP` sheet.
- **Annual:** completion totals recalculated from the imported monthly checkbox matrix.
- **Care:** milestone labels and the category snapshots found in `CARE`.
- Responsive phone layout, installable PWA manifest, app icon, and a small offline cache.

## Run locally

The app loads `data.json` with `fetch`, so serve the folder over HTTP rather than opening `index.html` as a `file://` URL.

With Python installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a browser.

## Install on a phone

To install it on Android or iPhone, the folder must be hosted at an HTTPS address. Open the hosted URL in the phone browser and use the browser's **Add to Home Screen** / **Install app** option. This prototype is not yet published to Google Play or Apple's App Store.

## Data and limitations

- All app data is packaged in `data.json`; progress edits are stored in the browser's local storage. They do not sync between devices.
- The workbook export contains some Google Sheets-only formulas represented as `DUMMYFUNCTION` wrappers in Excel. The prototype uses the preserved visible fallback task labels and recalculates completion percentages itself; it does not claim to emulate every original spreadsheet formula or formatting detail pixel-for-pixel.
- The `CARE` page shows the workbook's existing category snapshots and milestone/action labels. Because the source formulas don't fully export as executable formulas, those category snapshots are shown as imported values while the overall progress display is recalculated from the app's task states.
- Before a production release, test the app against the original Google Sheet and decide whether you want account-based cloud sync, reminders/notifications, editable schedules, and a native app wrapper.
