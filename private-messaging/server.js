
const WebSocket = require("ws");

const server = new WebSocket.Server({ port: 8080 });

const connectionsByUser=new Map();

function broadcastOnlineUsers() {
  const onlineUsers = Array.from(connectionsByUser.keys());

  const message = JSON.stringify({
    type: "onlineUsers",
    users: onlineUsers
  });

  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

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
  const name = socket.username;

if (!connectionsByUser.has(name)) {
  connectionsByUser.set(name, new Set());
}

connectionsByUser.get(name).add(socket);
const onlineUsers = Array.from(connectionsByUser.keys());
broadcastOnlineUsers();

console.log("Online users:", onlineUsers);
console.log(
  "Connections for " + name + ":",
  connectionsByUser.get(name).size
);

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

      
      if (chatMessage.type === "private") {
        const recipientName =
          typeof chatMessage.to === "string"
            ? chatMessage.to.trim()
            : "";

        if (!recipientName) {
          return;
        }

        const recipientConnections =
          connectionsByUser.get(recipientName);

        if (!recipientConnections) {
          socket.send(JSON.stringify({
            type: "error",
            message: "Recipient is not online."
          }));
          return;
        }

        const outgoingMessage = JSON.stringify({
          type: "privateMessage",
          from: socket.username,
          to: recipientName,
          text: chatMessage.text.trim()
        });

        recipientConnections.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(outgoingMessage);
          }
        });
        
        // Also send a copy to the sender.
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(outgoingMessage);
        }


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
  const name = socket.username;
  const userConnections = connectionsByUser.get(name);

  if (userConnections) {
    userConnections.delete(socket);

    if (userConnections.size === 0) {
      connectionsByUser.delete(name);
    }
  }
  broadcastOnlineUsers();
  const onlineUsers = Array.from(connectionsByUser.keys());

console.log("Online users:", onlineUsers);

  console.log("Disconnected user:", name);
  console.log("Connections for this user:", userConnections?.size ?? 0);
  console.log("Connected clients:", server.clients.size);
});


  socket.on("error", (error) => {
    console.log("Socket error:", error.message);
  });
});

console.log("WebSocket server running on port 8080");
