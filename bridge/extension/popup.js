document.getElementById("capture").addEventListener("click", () => {
  document.getElementById("status").innerText = "Capturing...";
  
  chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" }, (response) => {
    if (response && response.success) {
      document.getElementById("status").innerText = "Captured! ✅";
    } else {
      document.getElementById("status").innerText = "Failed ❌";
    }
    
    setTimeout(() => {
      document.getElementById("status").innerText = "Ready";
    }, 2000);
  });
});