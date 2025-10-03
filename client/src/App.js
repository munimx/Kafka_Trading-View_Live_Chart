import React, { useEffect, useState, useRef } from "react";

function App() {
  const [img, setImg] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [status, setStatus] = useState("Connecting...");
  const imgRef = useRef(null);

  useEffect(() => {
    let consecutiveErrors = 0;
    const maxErrors = 5;
    let lastImageHash = null;

    const fetchImage = async () => {
      try {
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`http://localhost:5075/latest?t=${timestamp}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) throw new Error("No image yet");
        
        const blob = await response.blob();
        
        // Create a hash to detect if image actually changed
        const arrayBuffer = await blob.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Only update if the image actually changed
        if (currentHash !== lastImageHash) {
          // Revoke old object URL to prevent memory leaks
          if (img) {
            URL.revokeObjectURL(img);
          }
          
          const newImgUrl = URL.createObjectURL(blob);
          setImg(newImgUrl);
          setLastUpdate(new Date());
          setStatus("Live");
          lastImageHash = currentHash;
          console.log("📸 New image received");
        }
        
        consecutiveErrors = 0;
      } catch (err) {
        consecutiveErrors++;
        if (consecutiveErrors >= maxErrors) {
          setStatus("Disconnected");
        } else {
          setStatus("Waiting for frames...");
        }
      }
    };

    // Initial fetch
    fetchImage();

    // Poll every 2 seconds
    const interval = setInterval(fetchImage, 2000);

    return () => {
      clearInterval(interval);
      // Cleanup object URL
      if (img) {
        URL.revokeObjectURL(img);
      }
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case "Live":
        return "#4CAF50";
      case "Disconnected":
        return "#f44336";
      default:
        return "#FF9800";
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "2rem",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        background: "white",
        borderRadius: "12px",
        padding: "2rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "1.5rem",
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: "1rem"
        }}>
          <h1 style={{ 
            margin: 0,
            color: "#333",
            fontSize: "2rem"
          }}>
            🌐 Real-time Webpage Stream
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: getStatusColor(),
                animation: status === "Live" ? "pulse 2s infinite" : "none"
              }}></div>
              <span style={{ 
                fontWeight: "bold",
                color: getStatusColor()
              }}>
                {status}
              </span>
            </div>
            {lastUpdate && (
              <span style={{ 
                color: "#666",
                fontSize: "0.9rem"
              }}>
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <div style={{
          background: "#f9f9f9",
          borderRadius: "8px",
          padding: "1rem",
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          {img ? (
            <img 
              ref={imgRef}
              src={img} 
              alt="Latest frame" 
              style={{ 
                maxWidth: "100%",
                height: "auto",
                borderRadius: "4px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "opacity 0.3s ease"
              }} 
            />
          ) : (
            <div style={{ textAlign: "center", color: "#999" }}>
              <div style={{
                fontSize: "3rem",
                marginBottom: "1rem"
              }}>📡</div>
              <p style={{ fontSize: "1.2rem" }}>Waiting for frames...</p>
              <p style={{ fontSize: "0.9rem" }}>
                Make sure the Chrome extension is active on any webpage
              </p>
            </div>
          )}
        </div>

        <div style={{
          marginTop: "1.5rem",
          padding: "1rem",
          background: "#f0f7ff",
          borderRadius: "8px",
          borderLeft: "4px solid #2196F3"
        }}>
          <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>
            <strong>🔌 How it works:</strong> The Chrome extension captures screenshots from any webpage every 3 seconds → 
            Streams through Kafka → Displays here in real-time
          </p>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default App;