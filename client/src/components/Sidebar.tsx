import {Drawer} from "@mui/material";
import {ProfileHeader} from "./Profileheader.tsx";
import {SearchBar} from "./Searchbar.tsx";
import {ChatList} from "./Chatlist.tsx";

export const Sidebar = () =>{
    return (
        <Drawer variant='permanent' sx ={{width: 320}}>
            
            <ProfileHeader></ProfileHeader>
            <SearchBar></SearchBar>
            <ChatList></ChatList>
        </Drawer>
    )
}