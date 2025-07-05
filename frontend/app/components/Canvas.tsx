"use client";
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./components.module.css";
import clsx from "clsx";

interface CanvasProps {
  color: string;
  lineWidth: number;
  tool: "brush" | "eraser";
  width: number | string;
  height: number | string;
  disabled?: boolean;
  onDraw: (data: any) => void; // Callback para enviar dados via WebSocket
}

// Expomos uma nova função 'drawFromBroadcast' no 'ref'
export interface CanvasRef {
  drawFromBroadcast: (data: any) => void;
  clear: () => void;
}

const Canvas = forwardRef<CanvasRef, CanvasProps>(
  (
    { color, lineWidth, tool, width, height, disabled = false, onDraw },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });

    // useImperativeHandle expõe funções para serem chamadas de fora via ref
    useImperativeHandle(ref, () => ({
      drawFromBroadcast: (data) => {
        const context = canvasRef.current?.getContext("2d");
        if (context) {
          context.beginPath();
          context.moveTo(data.lastX, data.lastY);
          context.lineTo(data.x, data.y);
          context.strokeStyle = data.tool === "eraser" ? "#FFFFFF" : data.color;
          context.lineWidth =
            data.tool === "eraser" ? data.lineWidth * 3 : data.lineWidth;
          context.lineCap = "round";
          context.lineJoin = "round";
          context.stroke();
        }
      },
      clear: () => {
        const context = canvasRef.current?.getContext("2d");
        if (context && canvasRef.current) {
          context.fillStyle = "#FFFFFF";
          context.fillRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        }
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext("2d");
        if (context) {
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, []);

    const getMousePos = (e: any) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e: any) => {
      if (disabled) return;
      isDrawing.current = true;
      lastPosition.current = getMousePos(e);
    };

    const draw = (e: any) => {
      if (!isDrawing.current || disabled) return;
      e.preventDefault();
      const currentPos = getMousePos(e);

      const drawData = {
        x: currentPos.x,
        y: currentPos.y,
        lastX: lastPosition.current.x,
        lastY: lastPosition.current.y,
        color,
        lineWidth,
        tool,
      };

      // Desenha localmente
      const context = canvasRef.current!.getContext("2d");
      if (context) {
        context.beginPath();
        context.moveTo(drawData.lastX, drawData.lastY);
        context.lineTo(drawData.x, drawData.y);
        context.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
        context.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
      }

      // Envia os dados do desenho via callback
      onDraw(drawData);

      lastPosition.current = currentPos;
    };

    const stopDrawing = () => {
      isDrawing.current = false;
    };

    return (
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={clsx(
          styles.canvas,
          disabled ? styles.canvasDisabled : styles.canvasEnabled
        )}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    );
  }
);

Canvas.displayName = "Canvas";
export default Canvas;
