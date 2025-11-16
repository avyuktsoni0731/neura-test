// lib/wsManager.ts
export type OnMsg = (msg: string) => void;
export type OnState = (state: number) => void;

export class WSManager {
  private url: string;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnect = 12;
  private queue: string[] = [];
  private pingInterval = 15000;
  private pingTimer: number | null = null;
  private manualClose = false;
  onMessage?: OnMsg;
  onState?: OnState;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.ws) return;
    this.manualClose = false;
    this.open();
  }

  private open() {
    try {
      this.ws = new WebSocket(this.url);
    } catch (err) {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this.reconnectAttempts = 0;
      this.startPing();
      this.flushQueue();
      this.onState?.(this.readyState);
    };

    this.ws.onmessage = (e) => {
      const data = typeof e.data === "string" ? e.data : "[binary]";
      this.onMessage?.(data);
    };

    this.ws.onclose = () => {
      this.stopPing();
      this.ws = null;
      this.onState?.(this.readyState);
      if (!this.manualClose) this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      // rely on onclose to handle reconnect
    };
  }

  send(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(text);
    } else {
      // queue with size bound
      if (this.queue.length > 200) this.queue.shift();
      this.queue.push(text);
    }
  }

  close() {
    this.manualClose = true;
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private flushQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    while (this.queue.length) {
      const m = this.queue.shift()!;
      try {
        this.ws.send(m);
      } catch {
        this.queue.unshift(m);
        break;
      }
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnect) return;
    this.reconnectAttempts++;
    const backoff = Math.min(30000, 400 * 2 ** this.reconnectAttempts);
    const jitter = Math.floor(Math.random() * 1000);
    setTimeout(() => this.open(), backoff + jitter);
  }

  private startPing() {
    this.stopPing();
    this.pingTimer = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify({ type: "ping", ts: Date.now() }));
        } catch {}
      }
    }, this.pingInterval);
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  get readyState() {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }
}
