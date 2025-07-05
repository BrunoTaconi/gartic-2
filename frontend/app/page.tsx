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

const wordList: Word[] = [
  { parts: ["GUARDA", "CHUVA"], keyword: "GUARDA-CHUVA" },
  { parts: ["CACHORRO", "QUENTE"], keyword: "CACHORRO-QUENTE" },
  { parts: ["PÃO", "QUEIJO"], keyword: "PÃO DE QUEIJO" },
  { parts: ["PÉ", "MOLEQUE"], keyword: "PÉ DE MOLEQUE" },
  { parts: ["ARCO", "ÍRIS"], keyword: "ARCO-ÍRIS" },
];

export default function HomePage() {
  const canvasRef1 = useRef<CanvasRef>(null);
  const canvasRef2 = useRef<CanvasRef>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string>("player1");
  const currentPlayer = MOCKED_PLAYERS[currentPlayerId];
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
    if (!socket) return;

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
          setMessage(message.payload.message);
          break;
      }
    };
  }, [socket]);

  const broadcastGameState = (
    updatedGame: GameState,
    updatedMessage: string
  ) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "GAME_STATE_UPDATE",
          payload: {
            game: updatedGame,
            message: updatedMessage,
          },
        })
      );
    }
  };

  const startNewTurn = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const newWord = wordList[randomIndex];
    const newGame: GameState = {
      word: newWord,
      drawer1: { id: "player1", word: newWord.parts[0] },
      drawer2: { id: "player2", word: newWord.parts[1] },
      guesses: [],
      score: 0,
      partsGuessed: [],
    };
    const newMessage = "Novo turno! Um palpite de cada vez.";

    setGame(newGame);
    setMessage(newMessage);
    canvasRef1.current?.clear();
    canvasRef2.current?.clear();
    broadcastGameState(newGame, newMessage);

    if (socket) {
      socket.send(
        JSON.stringify({ type: "CLEAR", payload: { drawerId: "DRAWER_1" } })
      );
      socket.send(
        JSON.stringify({ type: "CLEAR", payload: { drawerId: "DRAWER_2" } })
      );
    }
  };

  useEffect(() => {
    if (currentPlayer.id === "player1") {
      startNewTurn();
    }
  }, []);

  const handleGuess = (guessText: string) => {
    if (!game.word) return;
    const guessUpper = guessText.toUpperCase();
    const { keyword, parts } = game.word;

    let newGuess: Guess = {
      user: currentPlayer.name,
      text: guessText,
      type: "guess",
    };
    let newPartsGuessed = [...game.partsGuessed];
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

    const updatedGame = {
      ...game,
      guesses: [...game.guesses, newGuess],
      partsGuessed: newPartsGuessed,
    };

    broadcastGameState(updatedGame, messageUpdate);

    if (shouldStartNewTurn) setTimeout(startNewTurn, 3000);
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <div className={styles.playerSelectorGroup}>
          {Object.values(MOCKED_PLAYERS).map((player) => (
            <button
              key={player.id}
              onClick={() => setCurrentPlayerId(player.id)}
              className={clsx(
                styles.playerButton,
                currentPlayerId === player.id && styles.playerButtonActive
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
        <div className={styles.drawingSection}>
          <DrawingArea
            canvasRef={canvasRef1}
            title="Desenhista 1"
            wordToDraw={game.drawer1.word}
            isMyTurn={currentPlayer.role === "DRAWER_1"}
            drawerId="DRAWER_1"
          />
          <DrawingArea
            canvasRef={canvasRef2}
            title="Desenhista 2"
            wordToDraw={game.drawer2.word}
            isMyTurn={currentPlayer.role === "DRAWER_2"}
            drawerId="DRAWER_2"
          />
        </div>
        <div className={styles.infoSection}>
          <GameInfo
            game={game}
            onGuess={handleGuess}
            message={message}
            currentPlayer={currentPlayer}
          />
        </div>
      </main>
    </div>
  );
}
