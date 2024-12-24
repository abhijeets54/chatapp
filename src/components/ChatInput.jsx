import { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useSocket } from '../contexts/SocketContext';

const ChatInput = ({ selectedUser }) => {
  const [message, setMessage] = useState('');
  const socket = useSocket();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    socket.emit('message', {
      recipient: selectedUser._id,
      content: message
    });
    
    setMessage('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: 1,
        p: 2,
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      <TextField
        fullWidth
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={!selectedUser}
      />
      <IconButton type="submit" color="primary" disabled={!message.trim() || !selectedUser}>
        <SendIcon />
      </IconButton>
    </Box>
  );
};

export default ChatInput;