// server.js

require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

// Parse JSON bodies from Telnyx
app.use(express.json());

// Simple health check
app.get("/", (req, res) => {
  res.send("Telnyx Translator Bridge is running.");
});

// Telnyx Call Control webhook
app.post("/telnyx/webhook", (req, res) => {
  console.log("TELNYX WEBHOOK EVENT");
  console.log(JSON.stringify(req.body, null, 2));

  const event = req.body;
  const eventType = event?.data?.event_type;

  if (eventType === "call.initiated") {
    console.log("→ Incoming call started (ringing)");

    const response = [
      { instruction: "answer" },
      {
        instruction: "start_stream",
        stream_url: "wss://telnyx-bridge.onrender.com/telnyx/media",
      },
    ];

    console.log("→ Responding with:", JSON.stringify(response));
    return res.json(response);
  }

  console.log("→ Unhandled event type:", eventType);
  return res.json([]);
});

// Create HTTP server
const httpServer = http.createServer(app);

// WebSocket server for Telnyx media stream
const wss = new WebSocket.Server({
  server: httpServer,
  path: "/telnyx/media",
});

wss.on("connection", (ws, req) => {
  console.log("MEDIA WS CONNECTED");

  ws.on("message", (data) => {
    console.log("MEDIA WS MESSAGE BYTES:", data.length);
    // Later: decode audio, send to OpenAI, etc.
  });

  ws.on("close", () => {
    console.log("MEDIA WS CLOSED");
  });

  ws.on("error", (err) => {
    console.error("MEDIA WS ERROR:", err.message);
  });
});

// Port (Render sets PORT in env)
const PORT = process.env.PORT;

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// trigger deploy
