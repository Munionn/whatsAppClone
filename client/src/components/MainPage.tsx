import { Box, Drawer, AppBar, Toolbar, IconButton, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, InputBase, Paper, Divider, Modal, Snackbar } from '@mui/material';
// import { Menu, Search, Chat, MoreVert, Send, AttachFile, EmojiEmotions } from '@mui/icons-material';
import {Sidebar} from "./Sidebar.tsx";
import ChatPage from "./ChatPage.tsx";
import chatStore from "../store/chatStore.ts";


export function MainPage() {
    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Sidebar />
            <ChatPage/>
            {/*{chatStore.selectedChatId && <ChatPage/>}*/}
            {/*<ChatWindow />*/}
            {/*<ContactInfoPanel />*/}
            {/*<NewChatModal />*/}
            {/*<MediaPreviewModal />*/}
            {/*<SettingsPanel />*/}
            {/*<NotificationToast />*/}
        </Box>
    );
}