import { useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

type MessageHandler = (event: string, data: any) => void;

interface WebSocketMessage {
  type: string;
  channel?: string;
  event?: string;
  data?: any;
  timestamp?: number;
}

class RealtimeClient {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Set<MessageHandler>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private pingInterval: NodeJS.Timeout | null = null;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log("[Realtime] Connected");

        // Resubscribe to all channels
        this.subscriptions.forEach((_, channel) => {
          this.send({ type: "subscribe", channel });
        });

        // Start ping interval to keep connection alive
        this.pingInterval = setInterval(() => {
          this.send({ type: "ping" });
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error("[Realtime] Failed to parse message:", e);
        }
      };

      this.ws.onclose = () => {
        this.isConnecting = false;
        console.log("[Realtime] Disconnected");
        
        if (this.pingInterval) {
          clearInterval(this.pingInterval);
          this.pingInterval = null;
        }

        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
          console.log(`[Realtime] Reconnecting in ${delay}ms...`);
          setTimeout(() => this.connect(), delay);
        }
      };

      this.ws.onerror = (error) => {
        console.error("[Realtime] Error:", error);
      };
    } catch (e) {
      this.isConnecting = false;
      console.error("[Realtime] Failed to connect:", e);
    }
  }

  disconnect() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private handleMessage(message: WebSocketMessage) {
    if (message.type === "event" && message.channel && message.event) {
      const handlers = this.subscriptions.get(message.channel);
      if (handlers) {
        handlers.forEach((handler) => handler(message.event!, message.data));
      }
    }
  }

  subscribe(channel: string, handler: MessageHandler) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
      // Send subscribe message if connected
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: "subscribe", channel });
      }
    }
    this.subscriptions.get(channel)!.add(handler);
  }

  unsubscribe(channel: string, handler: MessageHandler) {
    const handlers = this.subscriptions.get(channel);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.subscriptions.delete(channel);
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.send({ type: "unsubscribe", channel });
        }
      }
    }
  }
}

// Singleton instance
let realtimeClient: RealtimeClient | null = null;

function getRealtimeClient() {
  if (!realtimeClient) {
    realtimeClient = new RealtimeClient();
  }
  return realtimeClient;
}

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const client = getRealtimeClient();
    client.connect();

    return () => {
      // Don't disconnect on unmount - keep connection alive
    };
  }, []);

  return { isConnected };
}

export function useBookingChannel(bookingId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!bookingId) return;

    const client = getRealtimeClient();
    client.connect();

    const channel = `booking:${bookingId}`;

    const handler: MessageHandler = (event, data) => {
      switch (event) {
        case "message.new":
          queryClient.invalidateQueries({ queryKey: ["booking-messages", bookingId] });
          queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
          break;

        case "booking.updated":
          queryClient.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
          queryClient.invalidateQueries({ queryKey: ["customer-booking-detail", bookingId] });
          break;

        case "location.update":
          queryClient.invalidateQueries({ queryKey: ["booking-live-location", bookingId] });
          queryClient.invalidateQueries({ queryKey: ["other-party-location", bookingId] });
          break;

        case "meeting.updated":
          queryClient.invalidateQueries({ queryKey: ["booking-detail", bookingId] });
          queryClient.invalidateQueries({ queryKey: ["customer-booking-detail", bookingId] });
          break;
      }
    };

    client.subscribe(channel, handler);

    return () => {
      client.unsubscribe(channel, handler);
    };
  }, [bookingId, queryClient]);
}

export function useCustomerChannel(customerId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!customerId) return;

    const client = getRealtimeClient();
    client.connect();

    const channel = `customer:${customerId}`;

    const handler: MessageHandler = (event, data) => {
      switch (event) {
        case "booking.updated":
          queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
          break;
      }
    };

    client.subscribe(channel, handler);

    return () => {
      client.unsubscribe(channel, handler);
    };
  }, [customerId, queryClient]);
}

export function usePhotographerChannel(photographerId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!photographerId) return;

    const client = getRealtimeClient();
    client.connect();

    const channel = `photographer:${photographerId}`;

    const handler: MessageHandler = (event, data) => {
      switch (event) {
        case "booking.new":
        case "booking.updated":
          queryClient.invalidateQueries({ queryKey: ["photographer-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["photographer-home-data"] });
          break;
      }
    };

    client.subscribe(channel, handler);

    return () => {
      client.unsubscribe(channel, handler);
    };
  }, [photographerId, queryClient]);
}

export function useUserChannel(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const client = getRealtimeClient();
    client.connect();

    const channel = `user:${userId}`;

    const handler: MessageHandler = (event, data) => {
      switch (event) {
        case "booking.updated":
          queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
          queryClient.invalidateQueries({ queryKey: ["photographer-bookings"] });
          break;
        case "message.new":
          queryClient.invalidateQueries({ queryKey: ["unread-messages"] });
          break;
      }
    };

    client.subscribe(channel, handler);

    return () => {
      client.unsubscribe(channel, handler);
    };
  }, [userId, queryClient]);
}

export function useRealtimeConnection(userId: string | undefined) {
  useUserChannel(userId);
}
