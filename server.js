// server.js
require("dotenv").config();

const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();

// FIX: Telnyx sends "application/json; charset=utf-8"
// This ensures the body is parsed correctly.
app.use(express.json({ type: "*/*" }));

// Basic config
const PORT = process.env.PORT || 3000;

// Health check
app.get("/", (req, res) => {
  res.send("Telnyx Translator Bridge is running.");
});

// ---------------------------------------------------------
// TELNYX WEBHOOK HANDLER
// ---------------------------------------------------------
app.post("/telnyx/webhook", (req, res) => {
  const event = req.body;

  console.log("TELNYX WEBHOOK EVENT");
  console.log(JSON.stringify(event, null, 2));

  const eventType = event?.data?.event_type;
  const payload = event?.data?.payload || {};

  let responseCommands = [];

  switch (eventType) {
    case "call.initiated":
      console.log("→ Incoming call started (ringing)");

      responseCommands = [
        { instruction: "answer" },
        {
          instruction: "start_stream",
          stream_url: "wss://telnyx-bridge.onrender.com/telnyx/media"
        }
      ];
      break;

    case "call.answered":
      console.log("→ Call was answered");
      responseCommands = [];
      break;

    case "call.hangup":
    case "call.completed":
      console.log("→ Call ended");
      responseCommands = [];
      break;

    default:
      console.log("→ No action for this event type:", eventType);
      responseCommands = [];
      break;
  }

  console.log("→ Responding with:", JSON.stringify(responseCommands));
  return res.json(responseCommands);
});

// ---------------------------------------------------------
// WEBSOCKET SERVER FOR MEDIA STREAM
// ---------------------------------------------------------
const httpServer = http.createServer(app);
const wss = new WebSocket.Server({ server: httpServer, path: "/telnyx/media" });

wss.on("connection", (ws) => {
  console.log("MEDIA WS CONNECTED");

  ws.on("message", (msg) => {
    console.log("MEDIA WS MESSAGE BYTES:", msg.length);
    // Here you will decode audio, send to OpenAI, etc.
  });

  ws.on("close", () => {
    console.log("MEDIA WS CLOSED");
  });
});

// ---------------------------------------------------------
// START SERVER
// ---------------------------------------------------------
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
