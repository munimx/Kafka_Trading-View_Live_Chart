# 📊 TradingView Real-time Chart Streaming System

A distributed system that captures TradingView charts in real-time using a Chrome extension, streams them through Kafka, and displays them on a live web dashboard.

## 🏗️ Architecture

```
Chrome Extension (TradingView) 
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

- ✅ **Automatic Screenshot Capture**: Chrome extension captures full TradingView page every 3 seconds
- ✅ **Real-time Streaming**: Kafka-based message queue for reliable data streaming
- ✅ **Live Dashboard**: React app with auto-refresh and live status indicator
- ✅ **Manual Capture**: Extension popup for on-demand screenshots
- ✅ **Dockerized Services**: All services run in isolated containers
- ✅ **Error Handling**: Graceful handling of disconnections and extension reloads

## 📁 Project Structure

```
kafka-stock-stream/
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
cd kafka-stock-stream
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

1. Open [TradingView](https://www.tradingview.com/chart/) in Chrome
2. The extension will automatically start capturing screenshots every 3 seconds
3. Open `http://localhost:3000` to see the live stream

## 🎯 Usage

### Automatic Capture
- Simply open TradingView with the extension installed
- Screenshots are captured every 3 seconds automatically
- Check browser console for capture logs

### Manual Capture
1. Click the extension icon in Chrome toolbar
2. Click **"Capture Now"** button
3. Status will show "Captured! ✅"

### View Live Stream
- Open `http://localhost:3000` in your browser
- Dashboard shows:
  - Live status indicator (green = connected, orange = waiting, red = disconnected)
  - Last update timestamp
  - Real-time chart images
  - Auto-refreshes every 2 seconds

## 🔧 Configuration

### Capture Interval
Edit `extension/content.js`:
```javascript
// Change from 3000ms (3s) to your desired interval
captureInterval = setInterval(captureFullScreenshot, 3000);
```

### Kafka Topic
Edit `bridge/server.js` and `consumer/app.py`:
```javascript
// Change topic name
topic: "chart_frames"
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

### Bridge (Node.js)
- **Framework**: Express.js
- **Library**: kafkajs
- **Port**: 4000
- **Function**: Receives screenshots from extension, publishes to Kafka

### Consumer (Python)
- **Framework**: Flask
- **Library**: kafka-python
- **Port**: 5075
- **Function**: Consumes from Kafka, saves latest image, serves via HTTP

### Client (React)
- **Framework**: React 18
- **Port**: 3000
- **Function**: Displays live stream with auto-refresh

## 🔍 Troubleshooting

### Extension Not Capturing
1. Check browser console for errors
2. Ensure extension has `tabs` permission in manifest
3. Reload extension: `chrome://extensions/` → Click reload button
4. **Close and reopen** the TradingView tab (refresh is not enough)

### Kafka Connection Errors
```bash
# Check Kafka is running
docker-compose ps

# View Kafka logs
docker-compose logs kafka

# Restart services
docker-compose restart
```

### CORS Errors
- Ensure `flask-cors` is installed in Python consumer
- Check `CORS(app)` is enabled in `consumer/app.py`

### Extension Context Invalidated
- This happens when you reload the extension while it's running
- **Solution**: Close and reopen the TradingView tab after reloading extension

### No Images in Dashboard
1. Check extension is capturing: Look for console logs in TradingView page
2. Check bridge is receiving: `docker-compose logs bridge`
3. Check consumer is processing: `docker-compose logs consumer`
4. Verify Kafka topic exists: `docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092`

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f bridge
docker-compose logs -f consumer
docker-compose logs -f kafka
```

### Check Kafka Topics
```bash
# List topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092

# Describe topic
docker exec -it kafka kafka-topics --describe --topic chart_frames --bootstrap-server localhost:9092
```

### Check Consumer Group
```bash
docker exec -it kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group chart-consumer
```

## 🧹 Cleanup

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

## 🚀 Production Deployment

### Security Considerations
1. **Change Kafka bootstrap servers** from `localhost` to actual hostnames
2. **Enable authentication** on Kafka
3. **Use HTTPS** for all web services
4. **Add rate limiting** to bridge API
5. **Implement proper CORS** policies
6. **Use production WSGI server** (gunicorn) instead of Flask dev server

### Environment Variables
Create `.env` file:
```env
KAFKA_BROKER=your-kafka-broker:9092
BRIDGE_PORT=4000
CONSUMER_PORT=5075
CLIENT_PORT=3000
```

## 📝 API Endpoints

### Bridge Server
- **POST** `/publish`
  ```json
  {
    "frame": "base64_encoded_image_data"
  }
  ```

### Consumer Server
- **GET** `/latest`
  - Returns: PNG image (latest captured frame)
  - Status: 200 (image found) or 404 (no image yet)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [Apache Kafka](https://kafka.apache.org/) - Distributed streaming platform
- [TradingView](https://www.tradingview.com/) - Charting platform
- [KafkaJS](https://kafka.js.org/) - Modern Kafka client for Node.js
- [kafka-python](https://github.com/dpkp/kafka-python) - Python client for Kafka

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review troubleshooting section above

---

**Made with ❤️ for real-time data streaming**