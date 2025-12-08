import { useWebSocket } from '../hooks/useWebSocket';
import { useState, useEffect } from 'react';

interface TelemetryData {
  bpm: number;
  rawBPM: number;
  status?: string;
  timestamp?: number;
  hz: number;
  amp_ms2: number;
}

const WS_URL = 'ws://192.168.4.1:81/';

export default function useTelemetryData() {
  const { lastMessage, readyState, reconnect } = useWebSocket(WS_URL);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    switch (readyState) {
      case WebSocket.CONNECTING:
        setConnectionStatus('connecting');
        break;
      case WebSocket.OPEN:
        setConnectionStatus('connected');
        break;
      case WebSocket.CLOSED:
        setConnectionStatus('disconnected');
        break;
    }
  }, [readyState]);

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage) as TelemetryData;
        setTelemetry(data);
        console.log('✅ Successfully parsed telemetry:', data);
      } catch (e) {
        console.error('❌ Failed to parse telemetry data:', e);
      }
    }
  }, [lastMessage, readyState]);

  return { telemetry, connectionStatus, reconnect };
}
