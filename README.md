# Context-Awareness System

An early-stage browser assistant that captures viewport context as you browse, reducing the need to manually copy webpage content into AI tools.

The current prototype focuses on local context acquisition and delivery. LLM integration is planned.

## Current Features

- Extract headings and paragraphs intersecting the viewport.
- Capture element positions and viewport intersection bounds.
- Update context after scrolling stops and when the window is resized.
- Send structured snapshots to a local Flask server.
- Keep the latest received snapshot in memory.

Observation starts when the extension icon is clicked. Currently tested manually in Microsoft Edge; Chrome compatibility has not yet been verified.

## Architecture

```text
Webpage
   ↓
content.js — Extract viewport context
   ↓
background.js — Forward context through HTTP
   ↓
Flask — Store and expose the latest snapshot
```

The Flask backend serves as a local experimentation interface. Its role in the final architecture is still under consideration.

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

## Roadmap

- [ ] Handle active-tab switching, page visibility, and navigation.
- [ ] Detect DOM changes without requiring scrolling.
- [ ] Expand extraction beyond headings and paragraphs.
- [ ] Improve visibility handling for clipping and occlusion.
- [ ] Add a lightweight floating interface for questions and answers.
- [ ] Format context for LLM integration.
- [ ] Explore task-aware context selection and memory.
- [ ] Add page exclusions, observation controls, and sensitive-content filtering.
- [ ] Verify Chrome compatibility.

The priority is reliable context acquisition, followed by context management and AI-assisted interaction.

## Privacy

Captured text, page titles, and URLs are sent to the local Flask process. No data is currently forwarded to an external AI service.

The prototype is intended for local development. Webpage content is treated as untrusted data.

## License

BSD 3-Clause. See [LICENSE](LICENSE).
