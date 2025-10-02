from flask import Flask, send_file
from flask_cors import CORS
from kafka import KafkaConsumer
import threading, base64, os

app = Flask(__name__)
CORS(app) 

LATEST_FILE = "latest.png"

def consume():
    consumer = KafkaConsumer(
        "chart_frames",
        bootstrap_servers="kafka:9092",
        auto_offset_reset="latest",
        enable_auto_commit=True,
        group_id="chart-consumer"
    )
    print("✅ Python consumer connected to Kafka, waiting for messages...")

    for msg in consumer:
        try:
            img_data = base64.b64decode(msg.value)
            with open(LATEST_FILE, "wb") as f:
                f.write(img_data)
            print("📥 Saved new frame from Kafka")
        except Exception as e:
            print("❌ Error processing message:", e)

@app.route("/latest")
def latest():
    if os.path.exists(LATEST_FILE):
        return send_file(LATEST_FILE, mimetype="image/png")
    else:
        return "No image yet", 404

if __name__ == "__main__":
    t = threading.Thread(target=consume, daemon=True)
    t.start()
    app.run(host="0.0.0.0", port=5075)