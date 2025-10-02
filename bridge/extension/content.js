let isCapturing = false;
let captureInterval = null;

function captureFullScreenshot() {
  if (isCapturing) return;
  
  if (!chrome.runtime?.id) {
    console.log("⚠️ Extension context invalidated, stopping captures");
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
    return;
  }

  isCapturing = true;

  try {
    chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("⚠️ Extension context lost:", chrome.runtime.lastError.message);
        if (captureInterval) {
          clearInterval(captureInterval);
          captureInterval = null;
        }
        isCapturing = false;
        return;
      }

      if (response && response.success) {
        console.log("📤 Full page screenshot captured and sent");
      } else {
        console.error("❌ Failed to capture screenshot:", response?.error);
      }
      isCapturing = false;
    });
  } catch (error) {
    console.log("⚠️ Caught error:", error.message);
    if (captureInterval) {
      clearInterval(captureInterval);
      captureInterval = null;
    }
    isCapturing = false;
  }
}

captureInterval = setInterval(captureFullScreenshot, 3000);

console.log("🎬 TradingView Kafka Bridge - Full page auto-capture started (every 3s)");