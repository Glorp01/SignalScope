# SignalScope Dashboard

SignalScope is a lightweight analytics dashboard built with plain HTML, CSS, and JavaScript. It lets you add records, compare actual values against targets, filter the dataset, and instantly generate percentages, charts, and quick insight cards.

## What It Does

- Add, edit, and delete records from a browser-based form
- Track `actual` vs `target` values with automatic progress percentages
- Filter records by search text, category, owner, and status
- Visualize data with a status mix chart, category share bars, a timeline trend chart, and target progress views
- Import data from `JSON` or `CSV`
- Export the current dataset as `JSON`
- Save records locally in the browser with `localStorage`

## Record Shape

Each record uses this structure:

```json
{
  "name": "Monthly recurring revenue",
  "category": "Revenue",
  "owner": "Finance",
  "status": "On Track",
  "date": "2026-03-24",
  "actual": 245000,
  "target": 260000,
  "notes": "Renewals are steady, new logo pipeline is still filling."
}
```

Accepted CSV column names include common aliases like:

- `name`, `metric`, `title`, `label`
- `category`, `group`, `department`
- `owner`, `team`, `assignee`
- `status`, `state`
- `date`, `day`
- `actual`, `value`, `current`
- `target`, `goal`, `expected`
- `notes`, `note`, `comment`, `comments`

## Run It Locally

Because this is a static app, you can just open `index.html` in a browser.

If you want a simple local server, examples are:

```powershell
python -m http.server 8000
```

```powershell
npx serve .
```

Then open the local URL your server prints.
