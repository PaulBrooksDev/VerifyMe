require("dotenv").config();
require("./db/mongoose");

const express = require("express");
const app = express();
const server = require("http").createServer(app);
const path = require("path");

const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const WebSocket = require("ws");
const wss = new WebSocket.Server({ server });

app.use(cookieParser());
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Sets up CORS for the server to allow requests from the client
if (process.env.NODE_ENV === "production") {
  app.use(
    cors({
      origin: [process.env.PRODUCTION_URL, process.env.SOCKET_PRODUCTION_URL],
      credentials: true,
    })
  );
} else {
  app.use(
    cors({
      origin: [
        `http://localhost:3000`,
        `http://127.0.0.1:3000`,
        "ws://localhost:3000",
        "ws://127.0.0.1:3000",
      ],
      credentials: true,
      contentType: "*",
    })
  );
}

// Points the server to the build folder of the React app
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}
// Sets the port for the server
const PORT = process.env.PORT || 5000;

// endpoint routes for the server to use when a request is made to the server from the client
const connect = require("./routes/connect");

app.use("/api/connect", connect);

// Websocket for the server to use if websocket requests are made from the client
wss.on("connection", (ws) => {
  ws.on("message", (msg) => {
    msg = JSON.parse(msg);

    if (msg.endpoint === "/api/test") {
      return console.log(msg.data);
    }
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

// Error handling for when an uncaught exception occurs. Prevents the server from crashing
process.on("uncaughtException", function (e) {
  console.error(e.message);
  console.log(
    "An uncaught exception has occured. Please notify the developer to fix the issue"
  );
});
