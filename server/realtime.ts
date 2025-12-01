import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "http";
import type { IncomingMessage } from "http";
import { parse } from "url";

interface ClientInfo {
  userId: string;
  subscriptions: Set<string>;
}

const clients = new Map<WebSocket, ClientInfo>();

let wss: WebSocketServer;

export function setupWebSocket(server: Server, sessionParser: any) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: IncomingMessage, socket, head) => {
    const { pathname } = parse(request.url || "");

    if (pathname === "/ws") {
      sessionParser(request, {} as any, () => {
        const session = (request as any).session;
        
        if (!session?.userId) {
          socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
          socket.destroy();
          return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request, session.userId);
        });
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", (ws: WebSocket, _request: IncomingMessage, userId: string) => {
    clients.set(ws, { userId, subscriptions: new Set() });

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleClientMessage(ws, message);
      } catch (e) {
        console.error("Invalid WebSocket message:", e);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });

    ws.send(JSON.stringify({ type: "connected", userId }));
  });

  return wss;
}

function handleClientMessage(ws: WebSocket, message: any) {
  const client = clients.get(ws);
  if (!client) return;

  switch (message.type) {
    case "subscribe":
      if (message.channel) {
        client.subscriptions.add(message.channel);
        ws.send(JSON.stringify({ type: "subscribed", channel: message.channel }));
      }
      break;

    case "unsubscribe":
      if (message.channel) {
        client.subscriptions.delete(message.channel);
        ws.send(JSON.stringify({ type: "unsubscribed", channel: message.channel }));
      }
      break;

    case "ping":
      ws.send(JSON.stringify({ type: "pong" }));
      break;
  }
}

export function broadcast(channel: string, event: string, data: any) {
  if (!wss) return;

  const message = JSON.stringify({ type: "event", channel, event, data, timestamp: Date.now() });

  clients.forEach((client, ws) => {
    if (ws.readyState === WebSocket.OPEN && client.subscriptions.has(channel)) {
      ws.send(message);
    }
  });
}

export function broadcastToUser(userId: string, event: string, data: any) {
  if (!wss) return;

  // Include channel so client can dispatch to handlers
  const channel = `user:${userId}`;
  const message = JSON.stringify({ type: "event", channel, event, data, timestamp: Date.now() });

  clients.forEach((client, ws) => {
    if (ws.readyState === WebSocket.OPEN && client.userId === userId) {
      ws.send(message);
    }
  });
}

export function broadcastToBooking(bookingId: string, event: string, data: any) {
  broadcast(`booking:${bookingId}`, event, data);
}

export function broadcastToPhotographer(photographerId: string, event: string, data: any) {
  broadcast(`photographer:${photographerId}`, event, data);
}

export function broadcastToCustomer(customerId: string, event: string, data: any) {
  broadcast(`customer:${customerId}`, event, data);
}
