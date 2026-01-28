// Minimal Telnyx webhook server + WebSocket endpoint for media streaming

require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const WebSocket = require("ws");

const app = express();
app.use(bodyParser.json({ type: "*/*" }));

app.get("/health", function (req, res) {
  res.status(200).send("ok");
});

// Telnyx will POST call events here
app.post("/telnyx/webhook", function (req, res) {
  console.log("TELNYX WEBHOOK EVENT");
  console.log(JSON.stringify(req.body || {}, null, 2));

  // Minimal: answer the call
  res.json([{ instruction: "answer" }]);
});

const httpServer = http.createServer(app);

// Telnyx media stream will connect here later (wss in production)
const wsServer = new WebSocket.Server({ server: httpServer, path: "/telnyx/media" });

wsServer.on("connection", function (socket) {
  console.log("MEDIA WS CONNECTED");

  socket.on("message", function (msg) {
    console.log("MEDIA WS MESSAGE BYTES");
    console.log(msg.length);
  });

  socket.on("close", function () {
    console.log("MEDIA WS CLOSED");
  });
});

const portVal = process.env.PORT || 10000;
httpServer.listen(portVal, function () {
  console.log("listening on " + portVal);
});