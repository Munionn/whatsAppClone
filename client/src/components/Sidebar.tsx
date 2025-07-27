import {Drawer} from "@mui/material";
import {ProfileHeader} from "./Profileheader.tsx";
import {ChatList} from "./Chatlist.tsx";
import {useState} from "react";
import {MenuBar} from "./MenuBar.tsx";

export const Sidebar = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [isOpenMenu, setIsOpenMenu] = useState<boolean>(false);
    return (
        <Drawer variant='permanent' sx={{width: 320}}>
            <ProfileHeader searchQuery={searchQuery}
                           setSearchQuery={setSearchQuery}
                           isOpen={isOpenMenu}
                           setIsOpen={setIsOpenMenu}
            ></ProfileHeader>
            {/*<ChatList searchQuery={searchQuery}></ChatList>*/}
            { isOpenMenu ? <MenuBar/> : <ChatList searchQuery={searchQuery}></ChatList>}

        </Drawer>
    )
}