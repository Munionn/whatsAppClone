import React, { useEffect, useState, useRef } from "react";
import { observer } from "mobx-react-lite";
import { io, Socket } from "socket.io-client";
import chatStore from "../store/chatStore";
import type { IMessage } from "../models/Message";
import { authStore } from "../store/authStore";

// Material UI imports
import {
  Box,
  Paper,
  List,
  ListItem,
  TextField,
  Button,
  Typography,
  IconButton,
  Avatar,
  Fade, Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';

const SOCKET_URL = "http://localhost:3000";

// Main chat container - full height with fixed positioning
const ChatContainer = styled(Box)({
  position: 'relative',
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

// Scrollable navbar that moves with content
const ScrollableNavBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 10,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(8px)',
  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
  padding: '12px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
}));

// Messages area that scrolls under the navbar
const MessagesArea = styled(Box)({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  position: 'relative',
  paddingBottom: '80px', // Space for fixed input
});

// Fixed bottom input container
const FixedInputContainer = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(0, 0, 0, 0.1)',
  padding: '16px 20px',
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-end',
  boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
  zIndex: 5,

});

// Enhanced message bubble with better styling
const MessageBubble = styled(Paper)<{ isSender: boolean }>(({ isSender, theme }) => ({
  padding: '12px 16px',
  margin: '4px 0',
  backgroundColor: isSender ? '#007AFF' : '#F1F1F1',
  color: isSender ? 'white' : '#000',
  alignSelf: isSender ? 'flex-end' : 'flex-start',
  maxWidth: '75%',
  borderRadius: isSender ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.1)',
  wordBreak: 'break-word',
  position: 'relative',
  '&::before': isSender ? {} : {
    content: '""',
    position: 'absolute',
    left: -6,
    bottom: 0,
    width: 0,
    height: 0,
    border: '6px solid transparent',
    borderRightColor: '#F1F1F1',
  },
  '&::after': isSender ? {
    content: '""',
    position: 'absolute',
    right: -6,
    bottom: 0,
    width: 0,
    height: 0,
    border: '6px solid transparent',
    borderLeftColor: '#007AFF',
  } : {},
}));

// Status indicator with animation
const StatusIndicator = styled(Box)<{ $connected: boolean }>(({ $connected }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '20px',
  backgroundColor: $connected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
  color: $connected ? '#4CAF50' : '#F44336',
  fontSize: '0.8rem',
  fontWeight: 600,
  '&::before': {
    content: '""',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: $connected ? '#4CAF50' : '#F44336',
    animation: $connected ? 'pulse 2s infinite' : 'none'
  },
  '@keyframes pulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.5 },
    '100%': { opacity: 1 }
  }
}));

// Custom input field
const StyledTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    padding: '0',
    borderRadius: '12px',
    backgroundColor: '#F8F8F8',
    '& fieldset': {
      border: '1px solid rgba(0, 0, 0, 0.1)',
      minHeight: '50px',
    },
    '&:hover fieldset': {
      border: '1px solid rgba(0, 0, 0, 0.2)',
    },
    '&.Mui-focused fieldset': {
      border: '2px solid #007AFF',
    },
  },
  '& .MuiOutlinedInput-input': {
    padding: '12px 12px',
    fontSize: '14px',
    height: '16px',
    lineHeight: '16px',
  },
});

// Enhanced Scroll Button Component
const ScrollToBottomButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: '90px',
  right: '20px',
  backgroundColor: '#007AFF',
  color: 'white',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  boxShadow: '0 4px 12px rgba(0, 122, 255, 0.4)',
  transition: 'all 0.3s ease',
  zIndex: 1000,
  '&:hover': {
    backgroundColor: '#0056CC',
    transform: 'scale(1.1)',
    boxShadow: '0 6px 16px rgba(0, 122, 255, 0.6)',
  },
  '&:active': {
    transform: 'scale(0.95)',
  },
  [theme.breakpoints.down('sm')]: {
    bottom: '80px',
    width: '40px',
    height: '40px',
  },
}));

// Send button with animation
// const SendButton = styled(IconButton)(({ disabled }) => ({
//   backgroundColor: disabled ? '#E0E0E0' : '#007AFF',
//   color: disabled ? '#9E9E9E' : 'white',
//   width: '48px',
//   height: '48px',
//   borderRadius: '50%',
//   transition: 'all 0.3s ease',
//   '&:hover': {
//     backgroundColor: disabled ? '#E0E0E0' : '#0056CC',
//     transform: disabled ? 'none' : 'scale(1.05)',
//   },
//   '&:active': {
//     transform: disabled ? 'none' : 'scale(0.95)',
//   },
// }));

const ChatPage: React.FC = observer(() => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedChat = chatStore.selectedChat;

  // Handle scroll to show/hide scroll to top button
  const handleScroll = () => {
    if (messagesAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesAreaRef.current;
      setShowScrollTop(scrollTop < scrollHeight - clientHeight - 100);
    }
  };

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (!selectedChat || !authStore.user) return;

    const socket = io(SOCKET_URL, {
      auth: {
        userId: authStore.user.id,
        chatId: selectedChat._id
      },
      transports: ["websocket"],
      query: {
        chatId: selectedChat._id,
        userId: authStore.user.id
      }
    });

    socketRef.current = socket;

    const handleConnect = () => {
      console.log("Socket connected to chat:", selectedChat._id);
      setIsConnected(true);
      socket.emit("join-room", selectedChat._id);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", () => {
      console.log("Socket disconnected from chat:", selectedChat._id);
      setIsConnected(false);
    });

    socket.on("new-message", (msg: IMessage) => {
      if (msg.senderId === authStore.user?.id) return;

      if (msg.chatId !== selectedChat._id) return;

      setMessages(prev => {
        const exists = prev.some(existingMsg => existingMsg._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    const loadMessages = async () => {
      try {
        const fetchedMessages = await chatStore.fetchMessages();
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();

    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit("leave-room", selectedChat._id);
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    };
  }, [selectedChat?._id, authStore.user?.id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || !selectedChat || !authStore.user) return;

    const tempId = Date.now().toString();
    const message = {
      chatId: selectedChat._id,
      content: input,
      senderId: authStore.user.id,
      type: "text",
      _id: tempId,
      createdAt: new Date().toISOString(),
      isRead: false,
      readBy: []
    };

    setMessages(prev => [...prev, message]);
    setInput("");

    try {
      await new Promise<void>((resolve, reject) => {
        if (!socketRef.current) return reject("Socket not connected");
        socketRef.current.timeout(5000).emit("send-message", message, (err: Error | null, response: { success: boolean, error?: string }) => {
          if (err || !response?.success) {
            reject(err || response?.error || "Failed to send message");
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages(prev => prev.filter(msg => msg._id !== tempId));
      alert("Failed to send message. Please try again.");
    }
  };

  if (!selectedChat) {
    return (
        <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
            }}
        >
          <Box>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              💬 Welcome to Chat
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a chat to start messaging
            </Typography>
          </Box>
        </Box>
    );
  }

  return (
      <ChatContainer>
        {/* Scrollable Navigation Bar */}
        <ScrollableNavBar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 40, height: 40, bgcolor: '#007AFF' }}>
              {selectedChat.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="600">
                {selectedChat.name}
              </Typography>
              <StatusIndicator $connected={isConnected}>
                {isConnected ? "Online" : "Offline"}
              </StatusIndicator>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" sx={{ color: '#007AFF' }}>
              {/*<Phone />*/}
            </IconButton>
            <IconButton size="small" sx={{ color: '#007AFF' }}>
              {/*<VideoCall />*/}
            </IconButton>
            <IconButton size="small" sx={{ color: '#007AFF' }}>
              {/*<MoreVert />*/}
            </IconButton>
          </Box>
        </ScrollableNavBar>
        {/* Messages Area */}
        <MessagesArea
            ref={messagesAreaRef}
            onScroll={handleScroll}
        >
          <Box sx={{ padding: '20px 20px 0 20px', minHeight: '100%' }}>
            <List disablePadding>
              {messages.map((msg, index) => {
                const isSender = msg.senderId === authStore.user?.id;
                const showTimeStamp = index === 0 ||
                    new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 minutes
                return (
                    <React.Fragment key={msg._id}>
                      {showTimeStamp && (
                          <Box sx={{ textAlign: 'center', my: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                              padding: '4px 12px',
                              borderRadius: '12px'
                            }}>
                              {new Date(msg.createdAt).toLocaleDateString() === new Date().toLocaleDateString()
                                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : new Date(msg.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                      )}
                      <ListItem
                          disableGutters
                          sx={{
                            justifyContent: isSender ? 'flex-end' : 'flex-start',
                            mb: 1
                          }}
                      >
                        <MessageBubble isSender={isSender}>
                          <Typography variant="body1" sx={{ lineHeight: 1.4 }}>
                            {msg.content}
                          </Typography>
                          <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                textAlign: 'right',
                                mt: 0.5,
                                opacity: 0.7
                              }}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </MessageBubble>
                      </ListItem>
                    </React.Fragment>
                );
              })}
              {/* Add margin/padding here */}
              <Box sx={{ marginBottom: '80px' }} />
              <div ref={messagesEndRef} />
            </List>
          </Box>
        </MessagesArea>
        {/* Fixed Bottom Input */}
        <FixedInputContainer>
          <Box component="form" onSubmit={sendMessage} sx={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-end'}}>
            <StyledTextField
                fullWidth
                multiline
                maxRows={4}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                variant="outlined"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
            />
            <Button
                type="submit"
                disabled={!input.trim()}
                sx={{
                  backgroundColor: '#007AFF',
                  color: 'white',
                  px: 2,
                  py: 1,
                  borderRadius: '24px',
                  '&:hover': { backgroundColor: '#0056CC' }
                }}
            >
              Send
            </Button>
          </Box>
        </FixedInputContainer>
        <Fade in={showScrollTop} timeout={300}>
          <Tooltip title="Scroll to latest messages" arrow>
            <ScrollToBottomButton onClick={scrollToBottom}>
              <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
              >
                <path d="M7.41 8.58L12 13.17l4.59-4.59L18 10l-6 6-6-6 1.41-1.42z" />
                <path fill="none" d="M0 0h24v24H0z" />
              </svg>
            </ScrollToBottomButton>
          </Tooltip>
        </Fade>
      </ChatContainer>
  );
});

export default ChatPage;