import React from 'react';
import { observer } from 'mobx-react-lite';
import { ListItem, ListItemAvatar, Avatar, ListItemText, Box, Typography, ListItemButton } from '@mui/material';

import chatStore from '../store/chatStore';
import type { IChat } from "../models/Chat.ts";

interface ChatListItemProps {
    chat: IChat;
}

export const ChatListItem: React.FC<ChatListItemProps> = observer(({ chat }) => {
    const isSelected = chat.id === chatStore.selectedChatId;

    return (
        <ListItem disablePadding>
            <ListItemButton
                selected={isSelected}
                onClick={() => chatStore.selectChat(chat.id)}
                sx={{ cursor: 'pointer' }}
            >
                <ListItemAvatar>
                    <Avatar alt={chat.name} src={chat.avatar || undefined} />
                </ListItemAvatar>
                <ListItemText
                    primary={
                        <Typography variant="subtitle1" color="textPrimary">
                            {chat.name}
                        </Typography>
                    }
                    secondary={
                        <Typography variant="body2" color="textSecondary">
                            {chat.lastMessage?.text || 'No messages yet'}
                        </Typography>
                    }
                />
                {chat.unread > 0 && !isSelected && (
                    <Box
                        sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 'auto',
                        }}
                    >
                        {chat.unread}
                    </Box>
                )}
            </ListItemButton>
        </ListItem>
    );
});


