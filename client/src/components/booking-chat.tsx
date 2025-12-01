import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useBookingChannel } from "@/hooks/use-realtime";

interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    fullName: string;
    profileImageUrl: string | null;
  };
}

interface BookingChatProps {
  bookingId: string;
  currentUserId: string;
  otherPartyName: string;
  isMinimized?: boolean;
  onToggle?: () => void;
}

export function BookingChat({ 
  bookingId, 
  currentUserId, 
  otherPartyName,
  isMinimized = false,
  onToggle
}: BookingChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Subscribe to real-time updates for this booking
  useBookingChannel(bookingId);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["booking-messages", bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchInterval: 30000, // Reduced polling since we have WebSocket
  });

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await fetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(["booking-messages", bookingId], (old = []) => 
        [...old, newMessage]
      );
      setMessage("");
    },
  });

  useEffect(() => {
    if (!isMinimized && messages.length > 0) {
      fetch(`/api/bookings/${bookingId}/messages/mark-read`, {
        method: "POST",
        credentials: "include",
      });
    }
  }, [bookingId, messages.length, isMinimized]);

  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized]);

  const handleSend = () => {
    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={onToggle}
        className="glass-dark rounded-2xl p-4 flex items-center justify-between w-full hover:bg-white/10 transition-colors"
        data-testid="button-open-chat"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-white font-medium">Messages with {otherPartyName}</p>
            <p className="text-xs text-muted-foreground">
              {messages.length === 0 ? "Start a conversation" : `${messages.length} message${messages.length === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>
        <div className="text-primary text-sm font-medium">Open</div>
      </button>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="booking-chat">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground text-sm">No messages yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Send a message to coordinate with {otherPartyName}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}
                data-testid={`message-${msg.id}`}
              >
                <img
                  src={msg.sender.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.fullName)}&background=random`}
                  alt={msg.sender.fullName}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
                <div className={cn(
                  "max-w-[70%]",
                  isMe ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "rounded-2xl px-4 py-2",
                    isMe 
                      ? "bg-primary text-white rounded-br-md" 
                      : "bg-card border border-white/10 text-white rounded-bl-md"
                  )}>
                    <p className="text-sm">{msg.body}</p>
                  </div>
                  <p className={cn(
                    "text-[10px] text-muted-foreground mt-1",
                    isMe ? "text-right" : "text-left"
                  )}>
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 bg-card border-white/10"
            data-testid="input-message"
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || sendMutation.isPending}
            size="icon"
            className="bg-primary hover:bg-primary/90"
            data-testid="button-send-message"
          >
            {sendMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
