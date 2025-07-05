import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

console.log("Servidor WebSocket iniciado na porta 8080.");

wss.on("connection", (ws: WebSocket) => {
  console.log("Novo cliente conectado.");

  ws.on("message", (message: string) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  ws.on("close", () => {
    console.log("Cliente desconectado.");
  });
});
