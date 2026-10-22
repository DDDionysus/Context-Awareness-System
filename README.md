# Context-Awareness System

An early-stage browser assistant that captures viewport context as you browse.

The project aims to reduce manual copying of webpage content into AI tools. The current prototype focuses on local context acquisition and delivery. LLM integration is not implemented yet.

## Current Features

- Start observing a page by clicking the extension icon.
- Extract headings (`h1`–`h6`) and paragraphs intersecting the viewport.
- Capture element positions and their intersection with the viewport.
- Update context after scrolling stops for approximately 300 ms.
- Update context when the browser window is resized.
- Send structured context to a local Flask server.
- Keep the latest received context in memory and expose it through an HTTP endpoint.

Currently tested manually in Microsoft Edge. Chrome compatibility has not yet been verified.

## Architecture

```text
Webpage
  │
  ▼
content.js
  Extract viewport context
  │
  ▼
background.js
  Forward context through HTTP
  │
  ▼
Flask
  Store and expose the latest received context
```

The Flask backend is currently a local prototype and experimentation interface. Whether it remains part of the final product architecture is still under consideration.

## Project Structure

```text
Context-Awareness-System/
├── src/
│   ├── extension/
│   │   ├── manifest.json
│   │   ├── background.js
│   │   └── content.js
│   └── server.py
├── .gitignore
└── README.md
```

## Getting Started

### 1. Start the Flask Server

Using your Python environment, install Flask:

```powershell
python -m pip install flask
```

Run the server from the project root:

```powershell
python src/server.py
```

Check that the server is available:

```text
http://127.0.0.1:5000/health
```

Expected response:

```json
{"status": "ok"}
```

### 2. Load the Extension in Edge

1. Open `edge://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `src/extension` directory.

No JavaScript build step is required.

### 3. Start Observation

1. Open a regular webpage.
2. Click the **Context Awareness** extension icon.
3. Scroll the page and wait approximately 300 ms.
4. Check the Flask terminal for incoming updates.

To inspect extension logs, open the extension's **service worker** developer tools from `edge://extensions`.

After changing extension files, reload the extension, refresh the test webpage, and click the extension icon again.

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check server availability |
| POST | `/context` | Submit a context snapshot |
| GET | `/context/current` | Read the latest received snapshot |

The server listens on `127.0.0.1:5000`.

Context is stored in memory, overwritten on each accepted update, and cleared when the server restarts.

## Context Format

Example payload:

```json
{
  "source": "browser",
  "event": "viewport_updated",
  "timestamp": "2026-10-22T12:00:00.000Z",
  "url": "https://example.com/",
  "page_title": "Example",
  "viewport": {
    "width": 1440,
    "height": 900,
    "scroll_x": 0,
    "scroll_y": 200
  },
  "visible_elements": [
    {
      "type": "p",
      "full_text": "Example paragraph text.",
      "element_rect": {
        "left": 100,
        "top": -20,
        "width": 600,
        "height": 80
      },
      "visible_rect": {
        "left": 100,
        "top": 0,
        "width": 600,
        "height": 60
      },
      "fully_inside_viewport": false
    }
  ]
}
```

Coordinates are relative to the viewport and measured in CSS pixels.

`full_text` contains the entire element's text, including portions outside the viewport. `visible_rect` describes its geometric intersection with the viewport.

## Current Limitations

- Extraction is limited to headings and paragraphs in the main document.
- Visibility checks do not account for occlusion or clipping by ancestor containers.
- Images, canvas content, iframe contents, and shadow-root contents are not extracted.
- Updates are triggered by scrolling and resizing; DOM changes are not monitored.
- Observation must be started again after a page reload or navigation.
- Active-tab switching and browser focus are not yet handled.
- The stored snapshot represents the latest received update, which may not be the currently visible tab.
- There is no history, persistent storage, LLM integration, or floating interface.
- The local Flask endpoint has no authentication and is intended for local development.

## Privacy

Captured page text, titles, and URLs are sent to the local Flask process. The current implementation does not forward them to an external AI service.

URLs and page content may contain sensitive information. Page exclusions, sensitive-content filtering, and observation controls are planned but not implemented.

Webpage content should be treated as untrusted data, not as instructions to the assistant.

## Direction

Potential next steps include:

- Active-tab and page-visibility handling.
- DOM change detection.
- A lightweight floating interface for questions and answers.
- Context formatting for downstream AI tools.
- Optional Python-based context processing.
- Chrome compatibility verification.

The guiding principle is to establish reliable context acquisition before adding context intelligence and LLM-driven interactions.
