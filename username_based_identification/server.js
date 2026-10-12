
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (socket, request) => {
  // Read the username from the connection URL.
  const url = new URL(
    request.url,
    "http://localhost:8080"
  );

  const username = url.searchParams.get("username");

  // Basic username validation.
  if (
    !username ||
    !username.trim() ||
    username.trim().length > 30
  ) {
    socket.close(1008, "Invalid username");
    return;
  }

  // Associate the username with this connection.
  socket.username = username.trim();

  console.log("Connected user:", socket.username);
  console.log("Connected clients:", server.clients.size);

  // Handle incoming chat messages.
  socket.on("message", (message) => {
    try {
      const chatMessage = JSON.parse(message.toString());

      // Validate the message text.
      if (
        typeof chatMessage.text !== "string" ||
        !chatMessage.text.trim() ||
        chatMessage.text.trim().length > 2000
      ) {
        return;
      }

      // Use the username stored on the server-side socket.
      const outgoingMessage = JSON.stringify({
        username: socket.username,
        text: chatMessage.text.trim()
      });

      // Broadcast to every connected client.
      server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(outgoingMessage);
        }
      });
    } catch (error) {
      console.log("Invalid message received");
    }
  });

  // Track disconnections.
  socket.on("close", () => {
    console.log("Disconnected user:", socket.username);
    console.log("Connected clients:", server.clients.size);
  });

  socket.on("error", (error) => {
    console.log("Socket error:", error.message);
  });
});

console.log("WebSocket server running on port 8080");
