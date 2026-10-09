const WebSocket=require("ws");
const server=new WebSocket.Server({port:8000});

server.on("connection",(socket)=>{
    console.log("Aclient connected");

    socket.on("message",(message)=>{
   console.log("Received :",message.toString());

   socket.send(`Server received: ${message}`);
    });
});

socket.on("close", () => {
    console.log("Client disconnected");
  });


  console.log("WebSocket server running on port 8080");