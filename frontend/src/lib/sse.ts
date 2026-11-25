import type { SSEEvent } from "./types";

type SSECallback = (event: SSEEvent) => void;

export function connectSSE(onEvent: SSECallback): () => void {
  const url = "http://localhost:8000/api/v1/stream";
  let eventSource: EventSource | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    eventSource = new EventSource(url);

    eventSource.onmessage = (e) => {
      try {
        const parsed: SSEEvent = JSON.parse(e.data);
        onEvent(parsed);
      } catch {
        // Ignore non-JSON heartbeats
      }
    };

    eventSource.onerror = () => {
      eventSource?.close();
      // Reconnect after 3 seconds
      reconnectTimer = setTimeout(connect, 3000);
    };
  }

  connect();

  // Return cleanup function
  return () => {
    eventSource?.close();
    if (reconnectTimer) clearTimeout(reconnectTimer);
  };
}
