"use client";
import { useState } from "react";
import Canvas from "./Canvas";
import Toolbar from "./Toolbar";
import styles from "./components.module.css";
import clsx from "clsx";

interface DrawingAreaProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  wordToDraw: string;
  title: string;
  isMyTurn: boolean;
}

const DrawingArea: React.FC<DrawingAreaProps> = ({
  canvasRef,
  wordToDraw,
  title,
  isMyTurn,
}) => {
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<any>("brush");

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.fillStyle = "#FFFFFF";
        context.fillRect(
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height
        );
      }
    }
  };

  return (
    <div
      className={clsx(
        ...styles.drawingArea,
        ...(isMyTurn
          ? styles.drawingAreaActive
          : styles.drawingAreaInactive)
      )}
    >
      <h2 className={styles.drawingAreaTitle}>{title}</h2>
      {isMyTurn && (
        <div className={styles.wordToDraw}>
          <p className={styles.wordToDrawLabel}>
            Sua palavra para desenhar é:
          </p>
          <p className={styles.wordToDrawText}>{wordToDraw}</p>
        </div>
      )}
      <div className={styles.canvasContainer}>
        <Toolbar
          color={color}
          setColor={setColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          setTool={setTool}
          clearCanvas={handleClearCanvas}
        />
        <div className={styles.canvasWrapper}>
          <Canvas
            ref={canvasRef}
            color={color}
            lineWidth={lineWidth}
            tool={tool}
            width={920}
            height={200}
            disabled={!isMyTurn}
          />
        </div>
      </div>
    </div>
  );
};

export default DrawingArea;
