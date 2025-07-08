import {AppBar, Avatar, IconButton, Toolbar} from "@mui/material";
import {authStore} from "../store/authStore.ts";
import Box from "@mui/material/Box";
export const ProfileHeader = () => {
    return (
        <AppBar position='static' color='default' elevation={0}>
            <Toolbar>
                <Avatar src={authStore.user?.picture}/>
                <Box sx={{ flexGrow: 1 }} />
                {/*<IconButton><Chat /></IconButton>*/}
                {/*<IconButton><MoreVert /></IconButton>*/}
            </Toolbar>
        </AppBar>
    );
}