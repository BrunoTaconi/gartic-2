import { WebSocket, WebSocketServer } from "ws";
import { GameState, Word } from "./app/types";

const wordList: Word[] = [
    { parts: ["GUARDA", "CHUVA"], keyword: "GUARDA-CHUVA" },
    { parts: ["CACHORRO", "QUENTE"], keyword: "CACHORRO-QUENTE" },
    { parts: ["PÃO", "DE QUEIJO"], keyword: "PÃO DE QUEIJO" },
    { parts: ["PÉ", "DE MOLEQUE"], keyword: "PÉ DE MOLEQUE" },
    { parts: ["ARCO", "ÍRIS"], keyword: "ARCO-ÍRIS" },
    { parts: ["COUVE", "FLOR"], keyword: "COUVE-FLOR" },
    { parts: ["GUARDA", "ROUPA"], keyword: "GUARDA-ROUPA" },
    { parts: ["BEIJA", "FLOR"], keyword: "BEIJA-FLOR" },
    { parts: ["SEGUNDA", "FEIRA"], keyword: "SEGUNDA-FEIRA" },
    { parts: ["SALVA", "VIDAS"], keyword: "SALVA-VIDAS" },
];


interface PlayerConnection {
    ws: WebSocket;
    playerId: string;
}

interface Room {
    id: string;
    players: PlayerConnection[];
    gameState: GameState;
}


const rooms: Map<string, Room> = new Map();

const wss = new WebSocketServer({ host: "0.0.0.0", port: 8001});

console.log("Servidor WebSocket iniciado na porta 8001.");

function broadcastToRoom(roomId: string, message: object) {
  const room = rooms.get(roomId);
  if (room) {
    const messageString = JSON.stringify(message);
    room.players.forEach((player) => {
      if (player.ws.readyState === WebSocket.OPEN) {
        player.ws.send(messageString);
      }
    });
  }
}


function startNewTurn(roomId: string) {
    const room = rooms.get(roomId);
    if (!room) return;

    const randomIndex = Math.floor(Math.random() * wordList.length);
    const newWord = wordList[randomIndex];

    const drawer1 = room.players.find(p => p.playerId === 'player1');
    const drawer2 = room.players.find(p => p.playerId === 'player2');


    const newGame: GameState = {
        word: newWord,
        drawer1: { id: drawer1 ? drawer1.playerId : "player1", word: newWord.parts[0] },
        drawer2: { id: drawer2 ? drawer2.playerId : "player2", word: newWord.parts[1] },
        guesses: [],
        score: 0,
        partsGuessed: [],
    };

    room.gameState = newGame;

    const message = "Novo turno! Um palpite de cada vez.";
    broadcastToRoom(roomId, {
        type: "NEW_TURN",
        payload: { game: room.gameState, message }
    });
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

            if (!roomId || !playerId) {
                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: 'ID da sala e do jogador são obrigatórios.' } }));
                return;
            }

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


            if (room.players.some(p => p.playerId === playerId)) {
                ws.send(JSON.stringify({ type: 'ERROR', payload: { message: `Jogador ${playerId} já está na sala.` } }));
                return;
            }


            room.players.push({ ws, playerId });
            console.log(`Cliente ${playerId} entrou na sala ${roomId}.`);


            ws.send(
                JSON.stringify({
                    type: "GAME_STATE_UPDATE",
                    payload: { game: room.gameState, message: "Você entrou na sala." },
                })
            );
            break;
        }


        case "START_NEW_TURN": {
            if (currentRoomId) {
                startNewTurn(currentRoomId);
            }
            break;
        }

        case "SUBMIT_GUESS": {
            const { roomId, playerId, guess } = data.payload;
            const room = rooms.get(roomId);
            if (!room || !room.gameState.word) return;

            const guessUpper = guess.toUpperCase();
            const { keyword, parts } = room.gameState.word;

            let newGuess = {
                user: playerId,
                text: guess,
                type: "guess",
            };
            let newPartsGuessed = [...room.gameState.partsGuessed];
            let messageUpdate = "Tente novamente!";
            let shouldStartNewTurn = false;

            if (guessUpper === keyword.toUpperCase()) {
                newGuess.type = "correct_keyword";
                messageUpdate = `Parabéns! "${keyword}"! Novo turno...`;
                shouldStartNewTurn = true;
            } else if (
                guessUpper === parts[0].toUpperCase() &&
                !newPartsGuessed.includes(parts[0].toUpperCase())
            ) {
                newPartsGuessed.push(parts[0].toUpperCase());
                newGuess.type = "correct_part";
                messageUpdate = `Boa! Acertaram a parte "${parts[0]}"!`;
            } else if (
                guessUpper === parts[1].toUpperCase() &&
                !newPartsGuessed.includes(parts[1].toUpperCase())
            ) {
                newPartsGuessed.push(parts[1].toUpperCase());
                newGuess.type = "correct_part";
                messageUpdate = `Incrível! Acertaram a parte "${parts[1]}"!`;
            }

            if (newPartsGuessed.length === 2 && !shouldStartNewTurn) {
                messageUpdate = `Excelente! Vocês descobriram "${keyword}"! Novo turno...`;
                shouldStartNewTurn = true;
            }
            room.gameState.guesses.push(newGuess);
            room.gameState.partsGuessed = newPartsGuessed;


            broadcastToRoom(roomId, {
                type: "GAME_STATE_UPDATE",
                payload: { game: room.gameState, message: messageUpdate }
            });

            if (shouldStartNewTurn) {
                setTimeout(() => startNewTurn(roomId), 3000);
            }
            break;
        }


      case "DRAW":
      case "CLEAR": {
        if (currentRoomId) {
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
        room.players = room.players.filter((player) => player.ws !== ws);
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