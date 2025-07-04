"use client";
import { useState, useRef, useEffect } from "react";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import GameInfo from "./components/GameInfo";
import { GameState, Guess, Word } from "./types";
import { MOCKED_PLAYERS } from "./components/data";
import { User, Users } from "lucide-react";
import DrawingArea from "./components/DrawingArea";
import styles from "./page.module.css";
import clsx from "clsx";

const wordList: Word[] = [
  { parts: ["GUARDA", "CHUVA"], keyword: "GUARDA-CHUVA" },
  { parts: ["CACHORRO", "QUENTE"], keyword: "CACHORRO-QUENTE" },
  { parts: ["PÃO", "QUEIJO"], keyword: "PÃO DE QUEIJO" },
  { parts: ["PÉ", "MOLEQUE"], keyword: "PÉ DE MOLEQUE" },
  { parts: ["ARCO", "ÍRIS"], keyword: "ARCO-ÍRIS" },
];

export default function HomePage() {
  const canvasRef1 = useRef<HTMLCanvasElement | any>(null);
  const canvasRef2 = useRef<HTMLCanvasElement | any>(null);
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

  useEffect(() => {
    startNewTurn();
  }, []);

  const clearAllCanvases = () => {
    [canvasRef1, canvasRef2].forEach((ref) => {
      if (ref.current) {
        const context = ref.current.getContext("2d");
        if (context) {
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, ref.current.width, ref.current.height);
        }
      }
    });
  };

  const startNewTurn = () => {
    const randomIndex = Math.floor(Math.random() * wordList.length);
    const newWord = wordList[randomIndex];
    setGame({
      word: newWord,
      drawer1: { id: "player1", word: newWord.parts[0] },
      drawer2: { id: "player2", word: newWord.parts[1] },
      guesses: [],
      score: 0,
      partsGuessed: [],
    });
    setMessage("Novo turno! Um palpite de cada vez.");
    clearAllCanvases();
    console.log(`Palavra-chave: ${newWord.keyword}`);
  };

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

    setGame((prev) => ({
      ...prev,
      guesses: [...prev.guesses, newGuess],
      partsGuessed: newPartsGuessed,
    }));
    setMessage(messageUpdate);
    if (shouldStartNewTurn) setTimeout(startNewTurn, 3000);
  };

  return (
    <div className={styles.container}>
      {/* <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>Trabalho de Redes</h1>
          <div className={styles.playerSelectorContainer}>
           
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
          </div>
        </div>
      </header> */}
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
          />
          <DrawingArea
            canvasRef={canvasRef2}
            title="Desenhista 2"
            wordToDraw={game.drawer2.word}
            isMyTurn={currentPlayer.role === "DRAWER_2"}
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
