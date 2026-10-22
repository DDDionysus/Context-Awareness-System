async function sendContext(context) {
  const response = await fetch("http://127.0.0.1:5000/context", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(context),
    signal: AbortSignal.timeout(3000)
  });

  if (!response.ok) {
    throw new Error(`Server returned HTTP ${response.status}`);
  }

  console.log("Context delivered to Python");
}

chrome.runtime.onMessage.addListener((message, sender) => {
  if (sender.id !== chrome.runtime.id) return;
  if (sender.tab?.id === undefined) return;
  if (message?.type !== "CONTEXT_UPDATED") return;

  console.log("Current page context", message.context);
  console.table(message.context.visible_elements);

  void sendContext(message.context).catch((error) => {
    console.error("Failed to deliver context to Python", error);
  });
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id === undefined) return;

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    console.log(results[0]?.result);
  } catch (error) {
    console.error("Failed to start observation", error);
  }
});
