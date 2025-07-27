import type {IMessage} from "../models/Message.ts";
import React from "react";
import {authStore} from "../store/authStore.ts";
import {
    ListItem, Paper,
    Typography,

} from '@mui/material';
import {styled} from "@mui/material/styles";

const MessageBubble = styled(Paper)<{ isSender: boolean }>(({ isSender, theme  } ) => ({
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


export const MemoizedMessageItem = React.memo(({msg}: { msg: IMessage }) => {
    const isSender = msg.senderId === authStore.user?.id;

    return (
        <ListItem
            disableGutters
            sx={{justifyContent: isSender ? 'flex-end' : 'flex-start', mb: 1}}
        >
            <MessageBubble isSender={isSender}>
                <Typography variant="body1" sx={{lineHeight: 1.4}}>
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
                    {msg.formattedTime}
                </Typography>
            </MessageBubble>
        </ListItem>
    );
});