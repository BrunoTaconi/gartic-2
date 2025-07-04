"use client";
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import styles from "./components.module.css";
import clsx from "clsx";

// Tipos para as propriedades do componente
interface CanvasProps {
  color: string;
  lineWidth: number;
  tool: "brush" | "eraser";
  width: number | string;
  height: number | string;
  disabled?: boolean;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(
  ({ color, lineWidth, tool, width, height, disabled = false }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPosition = useRef({ x: 0, y: 0 });

    useImperativeHandle(ref, () => canvasRef.current!);

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

    const getMousePos = (e:any) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (e:any) => {
      if (disabled) return;
      isDrawing.current = true;
      lastPosition.current = getMousePos(e);
    };

    const draw = (e:any) => {
      if (!isDrawing.current || disabled) return;
      e.preventDefault();
      const context = canvasRef.current!.getContext("2d");
      const currentPos = getMousePos(e);
      if (context) {
        context.beginPath();
        context.moveTo(lastPosition.current.x, lastPosition.current.y);
        context.lineTo(currentPos.x, currentPos.y);
        context.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;
        context.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.stroke();
      }
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
          disabled
            ? styles.canvasDisabled
            : styles.canvasEnabled
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
