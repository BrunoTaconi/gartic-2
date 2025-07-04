"use client";
import { Eraser, Paintbrush } from "lucide-react";
import styles from "./components.module.css";
import clsx from "clsx";

interface ToolbarProps {
  color: string;
  setColor: (color: string) => void;
  lineWidth: number;
  setLineWidth: (width: number) => void;
  setTool: (tool: "brush" | "eraser") => void;
  clearCanvas: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  color,
  setColor,
  lineWidth,
  setLineWidth,
  setTool,
  clearCanvas,
}) => {
  const colors = [
    "#000000",
    "#FF0000",
    "#0000FF",
    "#008000",
    "#FFFF00",
    "#FFA500",
    "#FF00FF",
    "#A020F0",
  ];
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <button
          onClick={() => setTool("brush")}
          className={styles.toolbarButton}
          aria-label="Pincel"
        >
          <Paintbrush size={20} />
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={styles.toolbarButton}
          aria-label="Borracha"
        >
          <Eraser size={20} />
        </button>
      </div>
      <div className={styles.toolbarGroup}>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className={styles.colorPicker}
        />
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={clsx(
              styles.colorSwatch,
              color === c && styles.colorSwatchActive
            )}
            style={{
              backgroundColor: c,
            }}
            aria-label={`Selecionar cor ${c}`}
          />
        ))}
      </div>
      <div className={styles.toolbarGroup}>
        <label htmlFor="lineWidth" className={styles.lineWidthLabel}>
          Tamanho:
        </label>
        <input
        className={styles.lineWidth}
          id="lineWidth"
          type="range"
          min="1"
          max="50"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
        />
      </div>
      <button onClick={clearCanvas} className={styles.clearButton}>
        Limpar
      </button>
    </div>
  );
};

export default Toolbar;
