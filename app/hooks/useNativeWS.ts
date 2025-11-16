// hooks/useNativeWS.ts
"use client";
import { useEffect, useRef, useState } from "react";
import { WSManager } from "../lib/wsmanager";

export function useNativeWS(url: string) {
  const managerRef = useRef<WSManager | null>(null);
  const [state, setState] = useState<number>(WebSocket.CLOSED);
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  useEffect(() => {
    const m = new WSManager(url);
    managerRef.current = m;

    m.onMessage = (msg) => setLastMessage(msg);
    m.onState = (s) => setState(s);

    m.connect();
    return () => {
      m.close();
      managerRef.current = null;
    };
  }, [url]);

  return {
    readyState: state,
    lastMessage,
    send: (t: string) => managerRef.current?.send(t),
  };
}
