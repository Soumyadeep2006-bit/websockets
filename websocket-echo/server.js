import {WebSocketServer} from "ws";
const server=new WebSocketServer({port:8080});

server.on("connection",(socket)=>{
    console.log("A client connected");

socket.on("message",(message)=>{
   console.log("Received :",message.toString());

socket.send(`Server received: ${message}`);
    });


socket.on("close", () => {
    console.log("Client disconnected");
  });
});


  console.log("WebSocket server running on port 8080");