"use client";
import { useState } from "react";
import Canvas, { CanvasRef } from "./Canvas";
import Toolbar from "./Toolbar";
import styles from "./components.module.css";
import clsx from "clsx";
import { useWebSocket } from "../context/SocketContext";

interface DrawingAreaProps {
  canvasRef: React.RefObject<CanvasRef>;
  wordToDraw: string;
  title: string;
  isMyTurn: boolean;
  drawerId: "DRAWER_1" | "DRAWER_2";

  onDraw: (drawData: any) => void;
  onClear: () => void;
}

const DrawingArea: React.FC<DrawingAreaProps> = ({
  canvasRef,
  wordToDraw,
  title,
  isMyTurn,
  drawerId,
  onDraw,
  onClear,
}) => {
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<any>("brush");
  const socket = useWebSocket();

  const handleDraw = (drawData: any) => {
    if (isMyTurn) {
      onDraw(drawData);
    }
  };

  const handleClearCanvas = () => {
    if (isMyTurn) {
      canvasRef.current?.clear();
      onClear();
    }
  };

  return (
    <div
      className={clsx(
        styles.drawingArea,
        isMyTurn ? styles.drawingAreaActive : styles.drawingAreaInactive
      )}
    >
      <h2 className={styles.drawingAreaTitle}>{title}</h2>
      {isMyTurn && (
        <div className={styles.wordToDraw}>
          <p className={styles.wordToDrawLabel}>Sua palavra para desenhar é:</p>
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
            width={700}
            height={448}
            disabled={!isMyTurn}
            onDraw={handleDraw} // Passe a função de callback
          />
        </div>
      </div>
    </div>
  );
};

export default DrawingArea;
