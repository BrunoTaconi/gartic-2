"use client";
import { useState } from "react";
import Canvas, { CanvasRef } from "./Canvas"; // Importe o CanvasRef
import Toolbar from "./Toolbar";
import styles from "./components.module.css";
import clsx from "clsx";
import { useWebSocket } from "../context/SocketContext"; // Importe o hook

interface DrawingAreaProps {
  canvasRef: React.RefObject<CanvasRef>; // Use o tipo CanvasRef
  wordToDraw: string;
  title: string;
  isMyTurn: boolean;
  drawerId: "DRAWER_1" | "DRAWER_2"; // Identificador para o desenhista
}

const DrawingArea: React.FC<DrawingAreaProps> = ({
  canvasRef,
  wordToDraw,
  title,
  isMyTurn,
  drawerId,
}) => {
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<any>("brush");
  const socket = useWebSocket();

  const handleDraw = (drawData: any) => {
    if (socket && isMyTurn) {
      const message = {
        type: "DRAW",
        payload: {
          drawerId,
          ...drawData,
        },
      };
      socket.send(JSON.stringify(message));
    }
  };

  const handleClearCanvas = () => {
    // Limpa o canvas localmente
    canvasRef.current?.clear();

    // Envia o evento de limpeza para outros jogadores
    if (socket && isMyTurn) {
      const message = {
        type: "CLEAR",
        payload: {
          drawerId,
        },
      };
      socket.send(JSON.stringify(message));
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
