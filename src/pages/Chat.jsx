// frontend/src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Typography, Paper, Grid } from '@mui/material';
import { io } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';
import axios from '../utils/axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_BACKEND_URL);

    // Connect user
    socketRef.current.emit('user_connected', user._id);

    // Listen for incoming messages
    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Fetch users
    fetchUsers();

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data.filter(u => u._id !== user._id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await axios.get(`/api/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !selectedFile) return;

    try {
      let fileUrl = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadResponse = await axios.post('/api/messages/upload', formData);
        fileUrl = uploadResponse.data.fileUrl;
      }

      const messageData = {
        recipientId: selectedUser._id,
        type: selectedFile ? selectedFile.type.startsWith('image/') ? 'image' : 
              selectedFile.type.startsWith('video/') ? 'video' : 'document' : 'text',
        content: newMessage,
        fileUrl
      };

      const response = await axios.post('/api/messages', messageData);
      socketRef.current.emit('send_message', response.data);
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      {/* Users List */}
      <Paper sx={{ width: 240, overflow: 'auto', p: 2 }}>
        <Typography variant="h6" gutterBottom>Users</Typography>
        {users.map(u => (
          <Box
            key={u._id}
            onClick={() => handleUserSelect(u)}
            sx={{
              p: 2,
              cursor: 'pointer',
              bgcolor: selectedUser?._id === u._id ? 'primary.light' : 'inherit',
              '&:hover': { bgcolor: 'primary.light' }
            }}
          >
            <Typography>{u.name}</Typography>
          </Box>
        ))}
      </Paper>

      {/* Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
        {selectedUser ? (
          <>
            <Typography variant="h6" gutterBottom>
              Chat with {selectedUser.name}
            </Typography>
            
            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
              {messages.map((message, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === user._id ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.sender === user._id ? 'primary.light' : 'grey.100'
                    }}
                  >
                    {message.type === 'text' ? (
                      <Typography>{message.content}</Typography>
                    ) : message.type === 'image' ? (
                      <img src={message.fileUrl} alt="Shared image" style={{ maxWidth: '100%' }} />
                    ) : message.type === 'video' ? (
                      <video controls src={message.fileUrl} style={{ maxWidth: '100%' }} />
                    ) : (
                      <Button href={message.fileUrl} target="_blank">
                        Download Document
                      </Button>
                    )}
                  </Paper>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </Box>

            {/* Message Input */}
            <form onSubmit={handleSendMessage}>
              <Grid container spacing={1}>
                <Grid item xs={9}>
                  <TextField
                    fullWidth
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                  />
                </Grid>
                <Grid item xs={2}>
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    style={{ display: 'none' }}
                    id="file-input"
                  />
                  <label htmlFor="file-input">
                    <Button component="span" variant="contained">
                      Attach File
                    </Button>
                  </label>
                </Grid>
                <Grid item xs={1}>
                  <Button type="submit" variant="contained">
                    Send
                  </Button>
                </Grid>
              </Grid>
            </form>
          </>
        ) : (
          <Typography variant="h6">Select a user to start chatting</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Chat;