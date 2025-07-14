"use client";
import { useRef, useState } from "react";
import { GameState, Guess, Player } from "../types";
import styles from "./components.module.css";
import { MessageSquare } from "lucide-react";
import clsx from "clsx";

interface GameInfoProps {
  game: GameState;
  onGuess: (guess: string) => void;
  message: string;
  currentPlayer: Player | null;
}

const GameInfo: React.FC<GameInfoProps> = ({
  game,
  onGuess,
  message,
  currentPlayer,
}) => {
  const [currentGuess, setCurrentGuess] = useState("");
  const guessesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentGuess.trim() && currentPlayer?.role === "GUESSER") {
      onGuess(currentGuess.trim());
      setCurrentGuess("");
    }
  };

  const generateKeywordDisplay = () => {
    if (!game.word) return "Carregando...";

    const { keyword, parts } = game.word;
    const [part1, part2] = parts;
    let display = keyword;

    if (currentPlayer?.role === "GUESSER") {
      const unGuessedParts = parts.filter(
        (p) => !game.partsGuessed.includes(p.toUpperCase())
      );
      unGuessedParts.forEach((part) => {
        const regex = new RegExp(
          part.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
          "gi"
        );
        display = display.replace(regex, (match) => match.replace(/\S/g, "_"));
      });
    } else if (currentPlayer?.role === "DRAWER_1") {
      const regex = new RegExp(
        part2.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "gi"
      );
      display = keyword.replace(regex, (match) => match.replace(/\S/g, "_"));
    } else if (currentPlayer?.role === "DRAWER_2") {
      const regex = new RegExp(
        part1.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
        "gi"
      );
      display = keyword.replace(regex, (match) => match.replace(/\S/g, "_"));
    }

    return display
      .split(" ")
      .map((word) => word.split("").join(" "))
      .join("   ");
  };

  const getGuessStyle = (type: any) => {
    switch (type) {
      case "correct_part":
        return styles.guessCorrectPart;
      case "correct_keyword":
        return styles.guessCorrectKeyword;
      default:
        return styles.guessNormal;
    }
  };

  return (
    <div className={styles.gameInfoContainer}>
      <div className={styles.keywordSection}>
        <h3 className={styles.keywordLabel}>Palavra-Chave:</h3>
        <p className={styles.keywordDisplay}>{generateKeywordDisplay()}</p>
        {message && <p className={styles.message}>{message}</p>}
      </div>
      <div className={styles.inputSection}>
        {currentPlayer?.role === "GUESSER" ? (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value)}
              placeholder="Digite seu palpite aqui..."
              className={styles.guessInput}
              disabled={currentPlayer?.role !== "GUESSER"}
            />
          </form>
        ) : (
          <div className={styles.inputDisabled}>
            <p className={styles.inputDisabledText}>Aguardando palpites...</p>
          </div>
        )}
      </div>
      <div className={styles.guessesSection}>
        <div className={styles.guessesHeader}>
          <MessageSquare size={20} style={{ color: "#6b7280" }} />
          <h3 className={styles.guessesTitle}>Palpites</h3>
        </div>

        <ul className={styles.guessesList}>
          {game.guesses.map((guess, index) => (
            <li
              key={index}
              className={clsx(styles.guessItem, getGuessStyle(guess.type))}
            >
              <span className={styles.guessUser}>{guess.user}:</span>{" "}
              {guess.text}
            </li>
          ))}
          <div ref={guessesEndRef} />
        </ul>
      </div>
    </div>
  );
};

export default GameInfo;
