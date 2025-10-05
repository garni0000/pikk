import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MoreVertical, Send, Plus, Smile } from "lucide-react";
import { useLocation } from "wouter";
import { Message, User } from "@shared/schema";

interface MessageWithSender extends Message {
  sender: User;
}

export default function Chat() {
  const { matchId } = useParams<{ matchId: string }>();
  const { user: currentUser } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messagesData, isLoading } = useQuery<{ messages: MessageWithSender[] }>({
    queryKey: ['/api/matches', matchId, 'messages'],
    enabled: !!matchId,
  });

  interface MatchWithUsers {
    id: string;
    user1: User;
    user2: User;
    user1Id: string;
    user2Id: string;
  }

  const { data: matchesData } = useQuery<{ matches: MatchWithUsers[] }>({
    queryKey: ['/api/matches'],
    enabled: !!currentUser,
  });

  const currentMatch = matchesData?.matches?.find((m: any) => m.id === matchId);
  const chatPartner = currentMatch 
    ? (currentMatch.user1.id === currentUser?.id ? currentMatch.user2 : currentMatch.user1)
    : null;

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/messages', {
        matchId,
        content,
      });
      return response.json();
    },
  });

  useEffect(() => {
    if (messagesData?.messages) {
      setMessages(messagesData.messages);
    }
  }, [messagesData]);

  useEffect(() => {
    // WebSocket connection for real-time messages
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      if (currentUser) {
        socket.send(JSON.stringify({
          type: 'authenticate',
          userId: currentUser.id,
        }));
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'message' && data.message.matchId === matchId) {
        setMessages(prev => [...prev, { ...data.message, sender: data.sender }]);
      }
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [currentUser, matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !ws || !currentUser) return;

    // Send via WebSocket for real-time delivery
    ws.send(JSON.stringify({
      type: 'message',
      matchId,
      senderId: currentUser.id,
      content: message.trim(),
    }));

    // Also save to database
    sendMessageMutation.mutate(message.trim());
    setMessage("");
  };

  const handleGoBack = () => {
    setLocation('/matches');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chatPartner) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Chat not found</h3>
          <Button onClick={handleGoBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-24">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Chat Header */}
        <Card className="border-b border-border px-4 py-4 flex items-center space-x-4 rounded-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="md:hidden"
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <img
              src={(chatPartner.photos as string[])?.[0] || '/api/placeholder/100/100'}
              alt={chatPartner.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-foreground" data-testid={`text-chat-partner-name`}>
              {chatPartner.name}
            </h3>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
          
          <Button variant="ghost" size="sm">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </Button>
        </Card>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
          {/* Date Divider */}
          <div className="flex items-center justify-center py-2">
            <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Today</span>
          </div>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-2 ${
                msg.senderId === currentUser?.id ? 'justify-end' : ''
              }`}
            >
              {msg.senderId !== currentUser?.id && (
                <img
                  src={(chatPartner.photos as string[])?.[0] || '/api/placeholder/100/100'}
                  alt={chatPartner.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.senderId === currentUser?.id
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-card text-card-foreground rounded-tl-sm'
                }`}
              >
                <p data-testid={`message-${msg.id}`}>{msg.content}</p>
                <span
                  className={`text-xs mt-1 block ${
                    msg.senderId === currentUser?.id
                      ? 'opacity-90 text-right'
                      : 'text-muted-foreground'
                  }`}
                >
                  {new Date(msg.createdAt!).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <Card className="border-t border-border p-4 rounded-none">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
            <Button type="button" variant="ghost" size="sm" className="rounded-full">
              <Plus className="w-5 h-5 text-primary" />
            </Button>
            
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full"
              data-testid="input-message"
            />
            
            <Button type="button" variant="ghost" size="sm" className="rounded-full">
              <Smile className="w-5 h-5 text-primary" />
            </Button>
            
            <Button 
              type="submit" 
              disabled={!message.trim() || sendMessageMutation.isPending}
              className="w-10 h-10 bg-primary rounded-full p-0"
              data-testid="button-send"
            >
              <Send className="w-4 h-4 text-white" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
