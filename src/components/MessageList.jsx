import { useEffect, useRef } from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const MessageList = ({ messages, selectedUser }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
      {messages.map((message, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            justifyContent: message.sender === user._id ? 'flex-end' : 'flex-start',
            mb: 2
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: message.sender === user._id ? 'row-reverse' : 'row',
              alignItems: 'center'
            }}
          >
            <Avatar src={message.sender === user._id ? user.profilePic : selectedUser?.profilePic} />
            <Box
              sx={{
                maxWidth: '70%',
                bgcolor: message.sender === user._id ? 'primary.main' : 'grey.200',
                color: message.sender === user._id ? 'white' : 'black',
                p: 2,
                borderRadius: 2,
                mx: 1
              }}
            >
              <Typography>{message.content}</Typography>
            </Box>
          </Box>
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

export default MessageList;