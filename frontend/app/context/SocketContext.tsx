"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

const WebSocketContext = createContext<WebSocket | null>(null);

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('Conectado ao servidor WebSocket');
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('Desconectado do servidor WebSocket');
      setSocket(null);
    };

 
    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};