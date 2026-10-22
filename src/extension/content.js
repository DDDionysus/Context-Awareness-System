(() => {
  if (globalThis.__contextObserverStarted) {
    return "Observation is already active on this page";
  }

  function extractContext() {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scroll_x: window.scrollX,
      scroll_y: window.scrollY
    };

    const elements = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6, p"
    );

    const visibleElements = [];

    for (const element of elements) {
      const rect = element.getBoundingClientRect();

      const left = Math.max(0, rect.left);
      const top = Math.max(0, rect.top);
      const right = Math.min(viewport.width, rect.right);
      const bottom = Math.min(viewport.height, rect.bottom);

      const visibleWidth = right - left;
      const visibleHeight = bottom - top;

      if (visibleWidth <= 0 || visibleHeight <= 0) continue;

      const style = window.getComputedStyle(element);

      if (
        style.visibility === "hidden" ||
        style.visibility === "collapse"
      ) {
        continue;
      }

      const text = element.innerText.replace(/\s+/g, " ").trim();

      if (!text) continue;

      visibleElements.push({
        type: element.tagName.toLowerCase(),

        // This is the full element text, not cropped visible text.
        full_text: text,

        element_rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height
        },

        // Intersection with the viewport; occlusion is not checked.
        visible_rect: {
          left,
          top,
          width: visibleWidth,
          height: visibleHeight
        },

        fully_inside_viewport:
          rect.left >= 0 &&
          rect.top >= 0 &&
          rect.right <= viewport.width &&
          rect.bottom <= viewport.height
      });
    }

    return {
      source: "browser",
      event: "viewport_updated",
      timestamp: new Date().toISOString(),
      url: location.href,
      page_title: document.title,
      viewport,
      visible_elements: visibleElements
    };
  }

  async function publishContext() {
    try {
      await chrome.runtime.sendMessage({
        type: "CONTEXT_UPDATED",
        context: extractContext()
      });
    } catch (error) {
      console.error("Failed to send context", error);
    }
  }

  let updateTimer;

  function scheduleUpdate() {
    clearTimeout(updateTimer);

    updateTimer = setTimeout(() => {
      void publishContext();
    }, 300);
  }

  document.addEventListener("scroll", scheduleUpdate, {
    capture: true,
    passive: true
  });

  window.addEventListener("resize", scheduleUpdate);

  globalThis.__contextObserverStarted = true;

  void publishContext();

  return "Observation started on this page";
})();
