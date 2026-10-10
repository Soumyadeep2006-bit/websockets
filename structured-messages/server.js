
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (socket) => {
  console.log("A client connected!");

 
socket.on("message", (message) => {
  try {
    const chatMessage = JSON.parse(message.toString());

    if (
      typeof chatMessage.username !== "string" ||
      typeof chatMessage.text !== "string" ||
      !chatMessage.username.trim() ||
      !chatMessage.text.trim()
    ) {
      return;
    }

    const outgoingMessage = JSON.stringify({
      username: chatMessage.username.trim(),
      text: chatMessage.text.trim()
    });

    server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(outgoingMessage);
      }
    });
  } catch (error) {
    console.log("Invalid message received");
  }
});


  socket.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on port 8080");
