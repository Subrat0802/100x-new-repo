import WebSocket, { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
  socket.on("message", (message) => {
    const parsedData = JSON.parse(message.toString());

    if (parsedData.type === "join") {
      allSockets.push({
        socket,
        room: parsedData.payload.roomId,
      });
    }

    if (parsedData.type === "chat") {
      const currentUser = allSockets.find((u) => u.socket === socket);
      if (!currentUser) return;

      for (let user of allSockets) {
        if (user.room === currentUser.room) {
          user.socket.send(
            JSON.stringify({
              type: "chat",
              chat: parsedData.payload.chat,
            })
          );
        }
      }
    }
  });

  socket.on("close", () => {
    allSockets = allSockets.filter((u) => u.socket !== socket);
  });
});






//=========
// wss.on("connection", (socket) => {
//   allSockets.push(socket);

//   try {
//     socket.on("message", (message) => {
//         console.log(message.toString());
//         allSockets.forEach(e => e.send(message.toString() + "Sent from server"));
//     });

//     socket.on("disconnect", () => {
//         allSockets.filter(e => e != socket); //sirf wo rakho jo socket ke equal nahi hai
//     })
//   } catch (error) {
//     console.log("Server error while connecting to ws");
//     error;
//   }
// });
