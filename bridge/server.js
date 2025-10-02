const express = require("express");
const bodyParser = require("body-parser");
const { Kafka } = require("kafkajs");

const app = express();
app.use(bodyParser.json({ limit: "10mb" }));

const kafka = new Kafka({
  clientId: "bridge-producer",
  brokers: ["kafka:9092"],
});

const producer = kafka.producer();

async function runProducer() {
  await producer.connect();
  console.log("✅ Node producer connected to Kafka");
}
runProducer().catch(console.error);

app.post("/publish", async (req, res) => {
  try {
    const { frame } = req.body;
    if (!frame) return res.status(400).send({ error: "Missing frame data" });

    await producer.send({
      topic: "chart_frames",
      messages: [{ value: frame }],
    });

    console.log("📤 Published frame to Kafka");
    res.status(200).send({ status: "ok" });
  } catch (err) {
    console.error("❌ Producer error:", err);
    res.status(500).send({ error: err.message });
  }
});

app.listen(4000, () => {
  console.log("🚀 Bridge server running on port 4000");
});
