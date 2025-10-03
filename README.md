# 🔍 Real-time Webpage Screenshot Streaming System

A distributed system that captures screenshots from any webpage in real-time using a Chrome extension, streams them through Kafka, and displays them on a live web dashboard.

> ⚠️ **IMPORTANT DISCLAIMER**: This project was initially designed for capturing TradingView charts for educational purposes. It has evolved into a general-purpose screenshot capture system that works on ANY webpage. This technology can be used for surveillance and monitoring. **This project is for EDUCATIONAL and LEARNING PURPOSES ONLY.** Users are solely responsible for ensuring their use complies with all applicable laws, regulations, and ethical guidelines. Unauthorized monitoring or capturing of content may violate privacy laws, terms of service, and intellectual property rights.

## 📜 Project History

- **Original Purpose**: Built to capture and stream TradingView chart data for real-time analysis
- **Evolution**: Expanded to work universally across all websites via Chrome extension
- **Current State**: General-purpose webpage screenshot streaming system with potential surveillance capabilities
- **Intent**: Educational demonstration of distributed streaming architecture with Kafka

## 🗺️ Architecture

```
Chrome Extension (Any Webpage) 
    ↓ (captures screenshots every 3s)
Node.js Bridge Server (Express + KafkaJS)
    ↓ (publishes to Kafka topic)
Apache Kafka (Message Broker)
    ↓ (streams data)
Python Consumer (Flask + kafka-python)
    ↓ (saves latest frame)
React Frontend (Auto-updating dashboard)
```

## 🚀 Features

- ✅ **Universal Screenshot Capture**: Chrome extension captures ANY webpage every 3 seconds
- ✅ **Automatic Operation**: Starts capturing immediately when page loads
- ✅ **Real-time Streaming**: Kafka-based message queue for reliable data streaming
- ✅ **Live Dashboard**: React app with auto-refresh and live status indicator
- ✅ **Manual Capture**: Extension popup for on-demand screenshots
- ✅ **Dockerized Services**: All services run in isolated containers
- ✅ **Smart Pause/Resume**: Pauses when tab is hidden, resumes when visible
- ✅ **Error Handling**: Graceful handling of disconnections and extension reloads

## 📁 Project Structure

```
kafka-screenshot-stream/
├── bridge/                    # Node.js producer
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
├── consumer/                  # Python consumer
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── client/                    # React frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── App.css
│       └── index.js
├── extension/                 # Chrome extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── popup.html
│   └── popup.js
├── docker-compose.yaml
└── README.md
```

## 🛠️ Prerequisites

- Docker & Docker Compose
- Google Chrome browser
- Node.js (for local development)
- Python 3.11+ (for local development)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kafka-screenshot-stream
```

### 2. Start Docker Services

```bash
# Build and start all containers
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

**Services will be available at:**
- Bridge Server: `http://localhost:4000`
- Python Consumer: `http://localhost:5075`
- React Dashboard: `http://localhost:3000`
- Kafka: `localhost:9092`

### 3. Install Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` folder from this project
5. The extension icon should appear in your toolbar

### 4. Start Capturing

1. Open ANY webpage in Chrome (the extension works on all sites)
2. The extension will automatically start capturing screenshots every 3 seconds
3. Open `http://localhost:3000` to see the live stream
4. Check browser console (F12) to see capture logs

## 🎯 Usage

### Automatic Capture
- Open any webpage with the extension installed
- Screenshots are captured every 3 seconds automatically
- Pauses when tab is hidden, resumes when visible
- Check browser console for capture logs with timestamps

### Manual Capture
1. Click the extension icon in Chrome toolbar
2. Click **"Capture Now"** button
3. Status will show "Captured! ✅"

### View Live Stream
- Open `http://localhost:3000` in your browser
- Dashboard shows:
  - Live status indicator (green = connected, orange = waiting, red = disconnected)
  - Last update timestamp
  - Real-time webpage screenshots
  - Auto-refreshes every 2 seconds

## 📧 Configuration

### Capture Interval
Edit `extension/content.js`:
```javascript
// Change from 3000ms (3s) to your desired interval
captureInterval = setInterval(() => {
  captureScreenshot();
}, 3000);
```

### Kafka Topic
Edit `bridge/server.js`:
```javascript
await producer.send({
  topic: "webpage_frames",  // Change topic name here
  messages: [{ value: frame }],
});
```

Edit `consumer/app.py`:
```python
consumer = KafkaConsumer(
    "webpage_frames",  # Change topic name here
    bootstrap_servers="kafka:9092",
    # ...
)
```

### React Polling Interval
Edit `client/src/App.js`:
```javascript
// Change from 2000ms (2s) to your desired interval
const interval = setInterval(fetchImage, 2000);
```

## 🐳 Docker Services

### Kafka
- **Image**: `confluentinc/cp-kafka:8.0.1`
- **Mode**: KRaft (no Zookeeper required)
- **Port**: 9092
- **Health Check**: Enabled with automatic retry logic

### Bridge (Node.js)
- **Framework**: Express.js
- **Library**: kafkajs
- **Port**: 4000
- **Function**: Receives screenshots from extension, publishes to Kafka
- **Payload Limit**: 10MB for large screenshots

### Consumer (Python)
- **Framework**: Flask
- **Library**: kafka-python
- **Port**: 5075
- **Function**: Consumes from Kafka, saves latest image, serves via HTTP
- **CORS**: Enabled for cross-origin requests

### Client (React)
- **Framework**: React 18
- **Port**: 3000
- **Function**: Displays live stream with auto-refresh and status indicators
- **Features**: Image deduplication, memory leak prevention, visual effects

## 🔍 Troubleshooting

### Extension Not Capturing
1. Open browser console (F12) on the target webpage
2. Look for logs: "🚀 Starting auto-capture" and "📸 Auto-capture triggered"
3. Ensure extension has proper permissions in `chrome://extensions/`
4. **Important**: After reloading extension, CLOSE and REOPEN the webpage (refresh is NOT enough)
5. Check that the page is not a restricted page (chrome://, chrome-extension://, etc.)

### Kafka Connection Errors
```bash
# Check all services are running
docker-compose ps

# View Kafka logs
docker-compose logs kafka

# Check if Kafka is healthy
docker-compose logs bridge | grep "connected"

# Restart specific service
docker-compose restart kafka
docker-compose restart bridge
```

### CORS Errors
- Ensure `flask-cors` is installed in Python consumer
- Verify `CORS(app)` is enabled in `consumer/app.py`
- Check browser console for specific CORS error messages

### Extension Context Invalidated
- This happens when you reload the extension while it's capturing
- **Solution**: Close and reopen ALL tabs where the extension is active
- The extension will detect this and stop auto-capture gracefully

### No Images in Dashboard
1. **Check extension is capturing**: Open console on target webpage, look for "📸 Auto-capture triggered" logs
2. **Check bridge is receiving**: `docker-compose logs bridge | grep "Published"`
3. **Check consumer is processing**: `docker-compose logs consumer | grep "Saved"`
4. **Verify Kafka topic**: 
   ```bash
   docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
   ```
5. **Check React is polling**: Open browser console on dashboard, look for fetch requests

### Tab Hidden/Paused Behavior
- Extension automatically pauses capture when tab is hidden
- Resumes when tab becomes visible again
- Check console logs: "⏸️ Tab hidden" and "▶️ Tab visible"

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f bridge
docker-compose logs -f consumer
docker-compose logs -f kafka
docker-compose logs -f client

# Filter by keyword
docker-compose logs | grep "ERROR"
docker-compose logs bridge | grep "Screenshot"
```

### Check Kafka Topics
```bash
# List all topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Describe specific topic
docker exec -it kafka kafka-topics --describe --topic webpage_frames --bootstrap-server localhost:9092

# Create topic manually (if needed)
docker exec -it kafka kafka-topics --create --topic webpage_frames --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

### Check Consumer Group
```bash
docker exec -it kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group webpage-consumer
```

### Monitor Extension Performance
Open Chrome DevTools on the target webpage:
- Console: View capture logs with timestamps
- Network: Check POST requests to localhost:4000
- Performance: Monitor memory usage (extension revokes old object URLs)

## 🧹 Cleanup

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Remove orphaned containers
docker-compose down --remove-orphans
```

## 🚀 Production Deployment Considerations

### Security Considerations
1. **Change Kafka bootstrap servers** from hardcoded values to environment variables
2. **Enable authentication** on Kafka (SASL/PLAIN or SASL/SCRAM)
3. **Use HTTPS** for all web services with proper SSL certificates
4. **Add rate limiting** to bridge API to prevent abuse
5. **Implement proper CORS** policies with allowlist of domains
6. **Use production WSGI server** (gunicorn/uwsgi) instead of Flask dev server
7. **Add API authentication** (JWT tokens, API keys)
8. **Implement logging and monitoring** (ELK stack, Prometheus)
9. **Add data retention policies** for Kafka topics
10. **Encrypt data in transit and at rest**

### Environment Variables
Create `.env` file:
```env
KAFKA_BROKER=your-kafka-broker:9092
KAFKA_USERNAME=your-username
KAFKA_PASSWORD=your-password
BRIDGE_PORT=4000
CONSUMER_PORT=5075
CLIENT_PORT=3000
NODE_ENV=production
```

## 📡 API Endpoints

### Bridge Server
- **POST** `/publish`
  - Request Body:
    ```json
    {
      "frame": "base64_encoded_image_data"
    }
    ```
  - Response (200):
    ```json
    {
      "status": "ok"
    }
    ```
  - Response (400):
    ```json
    {
      "error": "Missing frame data"
    }
    ```
  - Response (500):
    ```json
    {
      "error": "error_message"
    }
    ```

### Consumer Server
- **GET** `/latest?t={timestamp}`
  - Returns: PNG image (latest captured frame)
  - Headers: Cache-Control set to prevent caching
  - Status: 200 (image found) or 404 (no image yet)
  - Query Parameter: `t` (timestamp) to bypass browser cache

## ⚖️ Legal and Ethical Considerations

### Before Using This System:

1. **Privacy Laws**: Understand and comply with privacy laws in your jurisdiction (GDPR, CCPA, etc.)
2. **Terms of Service**: Review and respect the ToS of websites you capture
3. **Consent**: Obtain proper consent before monitoring or capturing content
4. **Copyright**: Be aware of intellectual property rights and fair use
5. **Purpose**: Use only for legitimate educational or authorized purposes
6. **Data Protection**: Secure all captured data appropriately
7. **Transparency**: Be transparent about data collection practices

### Prohibited Uses:
- ❌ Unauthorized surveillance or spying
- ❌ Violating website terms of service
- ❌ Capturing sensitive or private information without consent
- ❌ Corporate espionage or competitive intelligence gathering
- ❌ Stalking or harassment
- ❌ Any illegal or unethical activities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Apache Kafka](https://kafka.apache.org/) - Distributed streaming platform
- [KafkaJS](https://kafka.js.org/) - Modern Kafka client for Node.js
- [kafka-python](https://github.com/dpkp/kafka-python) - Python client for Kafka
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/) - For screenshot capture capabilities

## 🔧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review troubleshooting section above
- Consult Chrome extension documentation

---

**⚠️ Educational Project - Use Responsibly**

This project demonstrates distributed streaming architecture and real-time data processing. Users assume all responsibility for their use of this system.