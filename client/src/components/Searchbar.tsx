import Paper from "@mui/material/Paper";
import {IconButton, InputBase} from "@mui/material";

export const SearchBar = () => {
    return (
        <Paper sx={{ m: 2, p: '2px 4px', display: 'flex', alignItems: 'center' }}>
            {/*<IconButton><Search /></IconButton>*/}
            <InputBase placeholder="Search chats" fullWidth />
        </Paper>
    );
}