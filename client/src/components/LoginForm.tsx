import {useState} from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Link from '@mui/material/Link';
import {Link as RouterLink} from 'react-router-dom';
import api from "../service/api";
import {useNavigate} from "react-router-dom";
import {authStore} from "../store/authStore";
import {parseHtmlError} from "../utils/error.utils.ts";
const LoginForm = () => {
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>("");
    const navigate = useNavigate();
    const onSubmitLogin = async () => {
        setError(null); // Clear previous error

        try {
            const res = await api.post('/auth/login', {
                phoneNumber,
                password
            });

            const data = res.data;

            localStorage.setItem('token', data.accessToken);

            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                authStore.setUser(data.user);
            }

            navigate("/");
        } catch (err: any) {
            let errorMessage = 'An unknown error occurred';

            if (err.response) {
                if (typeof err.response.data === 'string' && err.response.data.includes('<pre')) {
                    errorMessage = parseHtmlError(err.response.data);
                } else if (err.response.data?.message) {
                    errorMessage = err.response.data.message;
                } else {
                    errorMessage = `Server responded with ${err.response.status}`;
                }
            } else if (err.request) {
                errorMessage = 'No response from server';
            } else {
                errorMessage = err.message || 'Unexpected error';
            }

            setError(errorMessage);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                minWidth: "100vw",
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1a202c 0%, #2d3748 100%)",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: -1,
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: 400,
                    display: "flex",
                    flexDirection: "column",
                    gap: 3,
                    backdropFilter: "blur(4px)",
                    background: "rgba(255,255,255,0.95)",
                }}
            >
                <Typography variant="h4" align="center" color="primary" fontWeight={700} mb={2}>
                    Login
                </Typography>
                <TextField
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    value={phoneNumber}
                    onChange={(e) => {
                        setPhoneNumber(e.target.value)
                        console.log(e.target.value)
                    }}
                    placeholder="Enter your phone number"
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                />
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    sx={{fontWeight: 600}}
                    onClick={onSubmitLogin}
                >
                    Login
                </Button>
                <Link component={RouterLink} to="/register" underline="hover" sx={{mt: 2, textAlign: 'center'}}>
                    Don't have an account? Register
                </Link>
                {error && (
                    <Typography color="error" align="center" sx={{mb: 2}}>
                        check your data that you input
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default LoginForm;