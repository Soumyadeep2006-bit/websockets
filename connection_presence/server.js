
const WebSocket = require("ws");
const {URL}=require("url");

const server = new WebSocket.Server({ port: 8080 });

server.on("connection", (socket,request) => {
    const url =new URL(request.url,"http://localhost:8080")

    const username =url.searchParams.get("username");
    socket.username=username;
  console.log("Connected user: ",username);
  console.log("Connected clients:", server.clients.size);

 

socket.on("message", (message) => {
  try {
    const chatMessage = JSON.parse(message.toString());

    if (
      typeof chatMessage.text !== "string" ||
      !chatMessage.text.trim()
    ) {
      return;
    }

    const outgoingMessage = JSON.stringify({
      username: socket.username,
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
     console.log("Connected clients:", server.clients.size);
  });
});

console.log("WebSocket server running on port 8080");
