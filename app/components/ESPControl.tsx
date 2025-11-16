"use client";
import { useNativeWS } from "../hooks/useNativeWS";

export default function ESPControl() {
  const url = process.env.NEXT_PUBLIC_WS_URL || "ws://192.168.4.1:81/";
  const { readyState, lastMessage, send } = useNativeWS(url);

  const label = (s: number) =>
    s === WebSocket.CONNECTING
      ? "CONNECTING"
      : s === WebSocket.OPEN
      ? "OPEN"
      : s === WebSocket.CLOSING
      ? "CLOSING"
      : "CLOSED";

  return (
    <div className="p-4">
      <h3>ESP32 LED</h3>
      <div className="flex gap-2 my-2">
        <button onClick={() => send("on")} className="cursor-pointer">
          ON
        </button>
        <button onClick={() => send("off")} className="cursor-pointer">
          OFF
        </button>
        <button onClick={() => send("toggle")} className="cursor-pointer">
          TOGGLE
        </button>
      </div>
      <div>State: {label(readyState)}</div>
      <div>Last: {lastMessage ?? "—"}</div>
    </div>
  );
}
