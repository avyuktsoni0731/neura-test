import { useEffect, useRef, useState } from 'react';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const connect = () => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      console.log('🔄 Attempting to connect to:', url);
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected successfully');
        setReadyState(WebSocket.OPEN);

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = event => {
        setLastMessage(event.data);
      };

      ws.onerror = error => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setReadyState(WebSocket.CLOSED);
      };

      setReadyState(WebSocket.CONNECTING);
    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      setReadyState(WebSocket.CLOSED);
    }
  };

  const reconnect = () => {
    console.log('🔄 Manual reconnect triggered');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    connect();
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [url]);

  const send = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(message);
    }
  };

  return {
    readyState,
    lastMessage,
    send,
    reconnect,
  };
}
