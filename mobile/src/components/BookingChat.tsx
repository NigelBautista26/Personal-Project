import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import api from '../api/client';

const PRIMARY_COLOR = '#2563eb';

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
}

export function BookingChat({ bookingId, currentUserId, otherPartyName }: BookingChatProps) {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['booking-messages', bookingId],
    queryFn: async () => {
      const res = await api.get(`/api/bookings/${bookingId}/messages`);
      return res.data;
    },
    refetchInterval: isExpanded ? 5000 : 30000,
  });

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const res = await api.post(`/api/bookings/${bookingId}/messages`, { body });
      return res.data;
    },
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(['booking-messages', bookingId], (old = []) => 
        [...old, newMessage]
      );
      setMessage('');
    },
  });

  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      api.post(`/api/bookings/${bookingId}/messages/mark-read`);
    }
  }, [bookingId, messages.length, isExpanded]);

  useEffect(() => {
    if (isExpanded && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isExpanded]);

  const handleSend = () => {
    if (message.trim() && !sendMutation.isPending) {
      sendMutation.mutate(message.trim());
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (item: Message) => {
    const isOwn = item.senderId === currentUserId;
    return (
      <View key={item.id} style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}>
        <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
          {item.body}
        </Text>
        <Text style={[styles.messageTime, isOwn ? styles.ownMessageTime : styles.otherMessageTime]}>
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.header} 
        onPress={() => setIsExpanded(!isExpanded)}
        testID="button-toggle-chat"
      >
        <View style={styles.headerLeft}>
          <View style={styles.iconWrapper}>
            <MessageCircle size={20} color={PRIMARY_COLOR} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Messages</Text>
            <Text style={styles.headerSubtitle}>Chat with {otherPartyName}</Text>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color="#9ca3af" />
        ) : (
          <ChevronDown size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.chatContent}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MessageCircle size={40} color="#6b7280" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Send a message to coordinate with {otherPartyName}.</Text>
            </View>
          ) : (
            <ScrollView
              ref={scrollViewRef}
              style={styles.messageList}
              contentContainerStyle={styles.messageListContent}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
            >
              {messages.map(renderMessage)}
            </ScrollView>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#6b7280"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity 
              style={[styles.sendButton, (!message.trim() || sendMutation.isPending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim() || sendMutation.isPending}
              testID="button-send-message"
            >
              {sendMutation.isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Send size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSubtitle: {
    color: '#9ca3af',
    fontSize: 12,
  },
  chatContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: 13,
    textAlign: 'center',
  },
  messageList: {
    maxHeight: 250,
  },
  messageListContent: {
    padding: 16,
    gap: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: PRIMARY_COLOR,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
