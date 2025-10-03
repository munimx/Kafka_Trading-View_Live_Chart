chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAPTURE_SCREENSHOT") {
    const tabId = sender.tab ? sender.tab.id : null;
    
    if (!tabId) {
      sendResponse({ success: false, error: "No tab ID found" });
      return;
    }

    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Screenshot error:", chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      
      const base64Data = dataUrl.split(",")[1];
      
      console.log("📸 Screenshot captured, size:", (base64Data.length / 1024).toFixed(2), "KB");
      
      fetch("http://localhost:4000/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frame: base64Data }),
      })
        .then((res) => res.json())
        .then((res) => {
          console.log("✅ Sent screenshot to Node bridge:", res);
          sendResponse({ success: true });
        })
        .catch((err) => {
          console.error("❌ Error sending screenshot:", err);
          sendResponse({ success: false, error: err.message });
        });
    });
    
    return true; 
  }
  
  return false;
});