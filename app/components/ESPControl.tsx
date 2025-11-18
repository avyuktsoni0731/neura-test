"use client";
import { useNativeWS } from "../hooks/useNativeWS";
import { useEffect, useState } from "react";

interface TelemetryData {
  pitch: number;
  roll: number;
  yaw: number;
  bpm: number;
  status: string;
  timestamp: number;
}

export default function ESPControl() {
  const url = process.env.NEXT_PUBLIC_WS_URL || "ws://192.168.4.1:81/";
  const { readyState, lastMessage } = useNativeWS(url);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage) as TelemetryData;
        setTelemetry(data);
      } catch (e) {
        console.error("Failed to parse telemetry data:", e);
      }
    }
  }, [lastMessage]);

  const connectionStatus = (s: number) =>
    s === WebSocket.CONNECTING
      ? { label: "Connecting", color: "text-yellow-500" }
      : s === WebSocket.OPEN
      ? { label: "Connected", color: "text-green-500" }
      : s === WebSocket.CLOSING
      ? { label: "Closing", color: "text-orange-500" }
      : { label: "Disconnected", color: "text-red-500" };

  const status = connectionStatus(readyState);

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-100">
          ESP32 Telemetry
        </h1>
        <div className="flex items-center justify-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              readyState === WebSocket.OPEN
                ? "bg-green-500 animate-pulse"
                : "bg-red-500"
            }`}
          />
          <span className={`text-sm font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>
      </div>

      {telemetry ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* MPU6500 Sensor Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  MPU6500
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Motion Sensor
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <DataRow
                label="Pitch"
                value={telemetry.pitch.toFixed(2)}
                unit="°"
                color="text-blue-600 dark:text-blue-400"
              />
              <DataRow
                label="Roll"
                value={telemetry.roll.toFixed(2)}
                unit="°"
                color="text-purple-600 dark:text-purple-400"
              />
              <DataRow
                label="Yaw"
                value={telemetry.yaw.toFixed(2)}
                unit="°"
                color="text-indigo-600 dark:text-indigo-400"
              />
            </div>
          </div>

          {/* MAX30102 Sensor Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
                  MAX30102
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Heart Rate Sensor
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  Heart Rate
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-red-600 dark:text-red-400">
                    {telemetry.bpm}
                  </span>
                  <span className="text-lg text-zinc-500 dark:text-zinc-400">
                    BPM
                  </span>
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  Status
                </div>
                <div
                  className={`text-lg font-medium ${
                    telemetry.status === "No Finger"
                      ? "text-orange-600 dark:text-orange-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {telemetry.status}
                </div>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                  Timestamp
                </div>
                <div className="text-lg font-mono text-zinc-700 dark:text-zinc-300">
                  {telemetry.timestamp.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 border-4 border-zinc-200 dark:border-zinc-700 border-t-blue-500 rounded-full animate-spin mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400">
            Waiting for telemetry data...
          </p>
        </div>
      )}
    </div>
  );
}

function DataRow({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
      <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${color}`}>{value}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">{unit}</span>
      </div>
    </div>
  );
}
