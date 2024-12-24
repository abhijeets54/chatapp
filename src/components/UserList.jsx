import { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { List, ListItem, ListItemText, Avatar, Box } from '@mui/material';

const UserList = ({ onSelectUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios.get('/api/users');
      setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <List>
      {users.map((user) => (
        <ListItem button key={user._id} onClick={() => onSelectUser(user)}>
          <Avatar src={user.profilePic} />
          <ListItemText primary={user.name} secondary={user.email} />
        </ListItem>
      ))}
    </List>
  );
};

export default UserList;