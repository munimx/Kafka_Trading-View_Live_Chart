chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "CAPTURE_SCREENSHOT") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) {
        sendResponse({ success: false, error: "No active tab" });
        return;
      }

      chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: "png" }, (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Screenshot error:", chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
          return;
        }
        
        const base64Data = dataUrl.split(",")[1];
        
        console.log("📸 Full page screenshot captured, size:", (base64Data.length / 1024).toFixed(2), "KB");
        
        fetch("http://localhost:4000/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame: base64Data }),
        })
          .then((res) => res.json())
          .then((res) => {
            console.log("✅ Sent full screenshot to Node bridge:", res);
            sendResponse({ success: true });
          })
          .catch((err) => {
            console.error("❌ Error sending screenshot:", err);
            sendResponse({ success: false, error: err.message });
          });
      });
    });
    
    return true; 
  }
});