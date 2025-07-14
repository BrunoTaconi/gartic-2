// app/GameClient.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { GameState, Guess, Word, Player } from "./types";
import { MOCKED_PLAYERS } from "./components/data";
import { User, Users } from "lucide-react";
import DrawingArea from "./components/DrawingArea";
import styles from "./page.module.css";
import clsx from "clsx";
import { CanvasRef } from "./components/Canvas";
import GameInfo from "./components/GameInfo";
import { useWebSocket } from "./context/SocketContext";
import { useHasMounted } from "./hooks/useHasMounted";

// const wordList: Word[] = [
//   { parts: ["GUARDA", "CHUVA"], keyword: "GUARDA-CHUVA" },
//   { parts: ["CACHORRO", "QUENTE"], keyword: "CACHORRO-QUENTE" },
//   { parts: ["PÃO", "QUEIJO"], keyword: "PÃO DE QUEIJO" },
//   { parts: ["PÉ", "MOLEQUE"], keyword: "PÉ DE MOLEQUE" },
//   { parts: ["ARCO", "ÍRIS"], keyword: "ARCO-ÍRIS" },
// ];

export default function GameClient() {
  const hasMounted = useHasMounted();
  const canvasRef1 = useRef<CanvasRef | any>(null);
  const canvasRef2 = useRef<CanvasRef | any>(null);

  const [roomId, setRoomId] = useState<string>("");
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const currentPlayer = selectedPlayerId
    ? MOCKED_PLAYERS[selectedPlayerId]
    : null;

  const [game, setGame] = useState<GameState>({
    word: null,
    drawer1: { id: "player1", word: "" },
    drawer2: { id: "player2", word: "" },
    guesses: [],
    score: 0,
    partsGuessed: [],
  });
  const [message, setMessage] = useState<string>("");
  const socket = useWebSocket();

  useEffect(() => {
    if (!socket || !hasJoined) return;

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "DRAW":
          const { drawerId, ...drawData } = message.payload;
          if (drawerId === "DRAWER_1") {
            canvasRef1.current?.drawFromBroadcast(drawData);
          } else if (drawerId === "DRAWER_2") {
            canvasRef2.current?.drawFromBroadcast(drawData);
          }
          break;
        case "CLEAR":
          if (message.payload.drawerId === "DRAWER_1") {
            canvasRef1.current?.clear();
          } else if (message.payload.drawerId === "DRAWER_2") {
            canvasRef2.current?.clear();
          }
          break;
        case "GAME_STATE_UPDATE":
          setGame(message.payload.game);
          setMessage(message.payload.message || "");
          break;
        case "ERROR":
          setErrorMessage(message.payload.message);
          break;
        case "NEW_TURN":
            setGame(message.payload.game);
            setMessage(message.payload.message);
            canvasRef1.current?.clear();
            canvasRef2.current?.clear();
            break;

      }
    };
  }, [socket, hasJoined]);

  const handleJoinRoom = () => {
      if (socket && selectedPlayerId && roomId) {
          setErrorMessage(""); // Limpa mensagens de erro anteriores
      socket.send(
        JSON.stringify({
          type: "JOIN_ROOM",
          payload: { roomId, playerId: selectedPlayerId },
        })
      );
      setHasJoined(true);
    }
  };

    const handleStartNewTurn = () => {
        if (socket && roomId) {
            socket.send(JSON.stringify({ type: "START_NEW_TURN", payload: { roomId } }));
        }
    };


  const handleDraw = (drawData: any, drawerId: string) => {
    if (socket && hasJoined) {
      socket.send(
        JSON.stringify({
          type: "DRAW",
          payload: { ...drawData, drawerId, roomId },
        })
      );
    }
  };

  const handleClear = (drawerId: string) => {
    if (socket && hasJoined) {
      if (drawerId === "DRAWER_1") canvasRef1.current?.clear();
      if (drawerId === "DRAWER_2") canvasRef2.current?.clear();

      socket.send(
        JSON.stringify({
          type: "CLEAR",
          payload: { drawerId, roomId },
        })
      );
    }
  };

  const handleGuess = (guessText: string) => {
      if (socket && currentPlayer && roomId) {
          socket.send(JSON.stringify({
              type: "SUBMIT_GUESS",
              payload: {
                  roomId,
                  playerId: currentPlayer.id,
                  guess: guessText
              }
          }));
      }
  };


  if (!hasMounted) {
    return null;
  }

  if (!hasJoined || !currentPlayer) {
    return (
      <div className={styles.container}>
        <main className={styles.mainContent}>
          <h2>Escolha seu Papel e Sala</h2>
          <div className={styles.playerSelectorGroup}>
            {Object.values(MOCKED_PLAYERS).map((player) => (
              <button
                key={player.id}
                onClick={() => setSelectedPlayerId(player.id)}
                className={clsx(
                  styles.playerButton,
                  selectedPlayerId === player.id && styles.playerButtonActive
                )}
              >
                {player.role === "GUESSER" ? (
                  <Users size={16} />
                ) : (
                  <User size={16} />
                )}
                {player.name}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="ID da Sala"
            className={styles.roomInput}
          />
          <button onClick={handleJoinRoom} disabled={!selectedPlayerId || !roomId}>
            Entrar na Sala
          </button>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        </main>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <div className={styles.drawingSection}>
          <DrawingArea
            canvasRef={canvasRef1}
            title="Desenhista 1"
            wordToDraw={game.drawer1.id === currentPlayer.id ? game.drawer1.word : ""}
            isMyTurn={currentPlayer.role === "DRAWER_1"}
            drawerId="DRAWER_1"
            onDraw={(drawData: any) => handleDraw(drawData, "DRAWER_1")}
            onClear={() => handleClear("DRAWER_1")}
          />
          <DrawingArea
            canvasRef={canvasRef2}
            title="Desenhista 2"
            wordToDraw={game.drawer2.id === currentPlayer.id ? game.drawer2.word : ""}
            isMyTurn={currentPlayer.role === "DRAWER_2"}
            drawerId="DRAWER_2"
            onDraw={(drawData: any) => handleDraw(drawData, "DRAWER_2")}
            onClear={() => handleClear("DRAWER_2")}
          />
        </div>
        <div className={styles.infoSection}>
          <GameInfo
            game={game}
            onGuess={handleGuess}
            message={message}
            currentPlayer={currentPlayer}
          />
            <button onClick={handleStartNewTurn} className={styles.newTurnButton}>
               Novo Turno
           </button>
        </div>
      </main>
    </div>
  );
}