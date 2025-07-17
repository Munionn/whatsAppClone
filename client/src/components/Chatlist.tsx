import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box } from '@mui/material';
import { ChatListItem } from "./ChatListItem.tsx";
import chatStore from '../store/chatStore';

export const ChatList = observer(() => {
    useEffect(() => {
        chatStore.fetchChats();
        console.log(chatStore.chats);
    }, []);

    const chats = chatStore.chatList;

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ p: 2 }} color="textPrimary">
                Chats
            </Typography>

            <List>
                {chats.map((chat) => (
                    <ChatListItem
                        key={chat._id } // Use either _id or id
                        chat={chat}
                    />
                ))}

                {chats.length === 0 && (
                    <ListItem>
                        <Typography variant="body2" color="textSecondary">
                            No chats yet
                        </Typography>
                    </ListItem>
                )}
            </List>
        </Box>
    );
});