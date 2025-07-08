import React, {useEffect} from 'react';
import { observer } from 'mobx-react-lite';
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box } from '@mui/material';

// Import ChatListItem and Store
import {ChatListItem} from "./ChatListItem.tsx";
import chatStore from '../store/chatStore';
import {fetchChats} from "../test/mockFunc.ts";

export const ChatList = observer(() => {
    useEffect(() => {
        fetchChats();
    }, []);
    const chats = chatStore.chatList;

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Typography variant="h6" sx={{ p: 2 }} color="textPrimary">
                Chats
            </Typography>

            <List>
                {chats.map((chat) => (
                    <ChatListItem key={chat.id} chat={chat} />
                ))}

                {chats.length === 0 && (
                    <Typography variant="body2" sx={{ p: 2 }} color="textSecondary">
                        No chats yet
                    </Typography>
                )}
            </List>
        </Box>
    );
});

