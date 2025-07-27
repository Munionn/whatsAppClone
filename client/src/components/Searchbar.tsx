import Paper from "@mui/material/Paper";
import {InputBase} from "@mui/material";



interface SearchBarProps {
    value: string;
    onChange: (query: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => {
    return (
        <Paper
            component="form"
            sx={{
                m: 2,
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '20px',
                height: '40px',
                boxShadow: '0 1px 5px rgba(0,0,0,0.1)'
            }}
            onSubmit={(e) => {e.preventDefault(); onChange(value);}}
        >

            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Search chats"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                inputProps={{ 'aria-label': 'search chats' }}

            />
        </Paper>
    );
};