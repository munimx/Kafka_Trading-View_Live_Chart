let captureInterval = null;
let isCapturing = false;

function startAutoCapture() {
  if (captureInterval) {
    console.log("⚠️ Auto-capture already running");
    return;
  }

  console.log("🚀 Starting auto-capture (every 3 seconds)");
  
  captureScreenshot();
  
  captureInterval = setInterval(() => {
    captureScreenshot();
  }, 3000);
}

function stopAutoCapture() {
  if (captureInterval) {
    clearInterval(captureInterval);
    captureInterval = null;
    console.log("🛑 Auto-capture stopped");
  }
}

function captureScreenshot() {
  if (isCapturing) {
    console.log("⏭️ Skipping capture (previous capture still in progress)");
    return;
  }

  isCapturing = true;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`📸 Auto-capture triggered at ${timestamp}`);

  chrome.runtime.sendMessage(
    { type: "CAPTURE_SCREENSHOT" },
    (response) => {
      isCapturing = false;
      
      if (chrome.runtime.lastError) {
        console.error("❌ Runtime error:", chrome.runtime.lastError.message);
        
        if (chrome.runtime.lastError.message.includes("Extension context invalidated")) {
          stopAutoCapture();
          console.log("⚠️ Extension reloaded - please refresh this page");
        }
        return;
      }

      if (response && response.success) {
        console.log(`✅ Auto-capture successful at ${timestamp}`);
      } else {
        console.error(`❌ Auto-capture failed at ${timestamp}:`, response?.error || "Unknown error");
      }
    }
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("📄 Page loaded, starting auto-capture");
    startAutoCapture();
  });
} else {
  console.log("📄 Page already loaded, starting auto-capture");
  startAutoCapture();
}

window.addEventListener("beforeunload", () => {
  console.log("👋 Page unloading, stopping auto-capture");
  stopAutoCapture();
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    console.log("⏸️ Tab hidden - pausing auto-capture");
    stopAutoCapture();
  } else {
    console.log("▶️ Tab visible - resuming auto-capture");
    startAutoCapture();
  }
});