
import { WebSocket, WebSocketServer } from "ws";
import { GameState, Word } from "./app/types"; 

interface Room {
  id: string;
  players: WebSocket[];
  gameState: GameState;
}


const rooms: Map<string, Room> = new Map();

const wss = new WebSocketServer({ port: 8080 });

console.log("Servidor WebSocket iniciado na porta 8080.");

function broadcastToRoom(roomId: string, message: object) {
  const room = rooms.get(roomId);
  if (room) {
    const messageString = JSON.stringify(message);
    room.players.forEach((player) => {
      if (player.readyState === WebSocket.OPEN) {
        player.send(messageString);
      }
    });
  }
}


wss.on("connection", (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentPlayerId: string | null = null;

  console.log("Novo cliente conectado.");

  ws.on("message", (message: string) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "JOIN_ROOM": {
        const { roomId, playerId } = data.payload;
        currentRoomId = roomId;
        currentPlayerId = playerId;

        let room = rooms.get(roomId);
        if (!room) {
         
          const initialGameState: GameState = {
            word: null,
            drawer1: { id: "player1", word: "" },
            drawer2: { id: "player2", word: "" },
            guesses: [],
            score: 0,
            partsGuessed: [],
          };
          room = { id: roomId, players: [], gameState: initialGameState };
          rooms.set(roomId, room);
          console.log(`Sala ${roomId} criada.`);
        }

        room.players.push(ws);
        console.log(`Cliente ${playerId} entrou na sala ${roomId}.`);

      
        ws.send(
          JSON.stringify({
            type: "GAME_STATE_UPDATE",
            payload: { game: room.gameState, message: "Você entrou na sala." },
          })
        );
        break;
      }

  
      case "DRAW":
      case "CLEAR":
      case "GAME_STATE_UPDATE": {
        if (currentRoomId) {
          const room = rooms.get(currentRoomId);
          if (room && data.type === "GAME_STATE_UPDATE") {
            room.gameState = data.payload.game;
          }
          broadcastToRoom(currentRoomId, data);
        }
        break;
      }
    }
  });

  ws.on("close", () => {
    console.log("Cliente desconectado.");
    if (currentRoomId && currentPlayerId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.players = room.players.filter((player) => player !== ws);
        console.log(
          `Cliente ${currentPlayerId} removido da sala ${currentRoomId}.`
        );
        if (room.players.length === 0) {
          rooms.delete(currentRoomId);
          console.log(`Sala ${currentRoomId} removida.`);
        }
      }
    }
  });
});
