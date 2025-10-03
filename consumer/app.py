from flask import Flask, send_file
from flask_cors import CORS
from kafka import KafkaConsumer
import threading, base64, os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

LATEST_FILE = "latest.png"

def consume():
    consumer = KafkaConsumer(
        "webpage_frames",
        bootstrap_servers="kafka:9092",
        auto_offset_reset="latest",
        enable_auto_commit=True,
        group_id="webpage-consumer"
    )
    print("✅ Python consumer connected to Kafka, waiting for messages...")

    for msg in consumer:
        try:
            img_data = base64.b64decode(msg.value)
            with open(LATEST_FILE, "wb") as f:
                f.write(img_data)
            file_size = len(img_data) / 1024  # KB
            print(f"💾 Saved new frame from Kafka ({file_size:.2f} KB) at {os.path.getmtime(LATEST_FILE)}")
        except Exception as e:
            print("❌ Error processing message:", e)

@app.route("/latest")
def latest():
    if os.path.exists(LATEST_FILE):
        response = send_file(LATEST_FILE, mimetype="image/png")
        # Prevent caching
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        return response
    else:
        return "No image yet", 404

if __name__ == "__main__":
    t = threading.Thread(target=consume, daemon=True)
    t.start()
    app.run(host="0.0.0.0", port=5075)