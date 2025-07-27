import { AppBar, Box} from "@mui/material";
import { SearchBar } from "./Searchbar.tsx";
import MenuIcon from '@mui/icons-material/Menu';

interface ProfileHeaderProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const ProfileHeader = ({ searchQuery, setSearchQuery, isOpen, setIsOpen }: ProfileHeaderProps) => {
    return (
        <AppBar
            position="relative"
            color="default"
            elevation={0}
            sx={{
                backgroundColor: 'transparent',
                borderBottom: '1px solid #e0e0e0',
                padding: '8px 16px'
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    minHeight: '76px',
                }}
            >

                {/*<Avatar*/}
                {/*    src={authStore.user?.picture}*/}
                {/*    alt={authStore.user?.name}*/}
                {/*    sx={{ width: 36, height: 36 }}*/}
                {/*>*/}
                {/*    {authStore.user?.name?.charAt(0).toUpperCase()}*/}
                {/*</Avatar>*/}

                <MenuIcon onClick={() => setIsOpen(!isOpen)} />


                {!isOpen && (
                    <Box sx={{ flex: 1 }}>
                        <SearchBar value={searchQuery} onChange={setSearchQuery} />
                    </Box>
                )}
            </Box>
        </AppBar>
    );
};