import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import UserInfo from "./UserInfo.tsx";
import {Switch} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';



export const MenuBar = () => {

    return (
        <Box sx={{ width: "100%", alignItems: "center" }}>
            <UserInfo></UserInfo>
            <Button sx={{alignContent: 'flex-start'}}><PersonIcon/>create chat</Button>
            <Switch>Night Mod</Switch>
        </Box>
    )
}