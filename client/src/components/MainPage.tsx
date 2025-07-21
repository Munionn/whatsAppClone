import { Box, Drawer, AppBar, Toolbar, IconButton, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, InputBase, Paper, Divider, Modal, Snackbar } from '@mui/material';
// import { Menu, Search, Chat, MoreVert, Send, AttachFile, EmojiEmotions } from '@mui/icons-material';
import {Sidebar} from "./Sidebar.tsx";
import ChatPage from "./ChatPage.tsx";
import chatStore from "../store/chatStore.ts";

const drawerWidth = 300;

export function MainPage() {
    return (
        <Box sx={{ display: 'flex', height: '100vh' }}>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Sidebar />
            </Drawer>

            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <ChatPage />
            </Box>
        </Box>
    );

}