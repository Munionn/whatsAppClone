import {useState} from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import api from "../service/api";
import {typeError} from "../models/IError.ts";
import {useNavigate} from "react-router-dom";
import { authStore } from "../store/authStore";
import { Link as RouterLink } from "react-router-dom";
import { Link } from "@mui/material";

const RegisterForm = () => {
    const navigate = useNavigate();
    const [phone, setPhone] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [errors, setErrors] = useState<typeError[]>([]);

    const onSubmitLogin = () => {
        const phoneRegex = /^\+?[0-9\s\-()]{7,}$/;

        const errors: typeError[] = [];

        if (password === "") {
            errors.push(typeError.NO_PASSWORD);
        }
        if (name === "") {
            errors.push(typeError.NO_NAME);
        }
        if (phone === "") {
            errors.push(typeError.NO_PHONE_NUMBER);
        } else if (!phoneRegex.test(phone)) {
            // Only check regex if phoneNumber is not empty
            errors.push(typeError.WRONG_PHONE_NUMBER);
        }
        if (password !== confirmPassword) {
            errors.push(typeError.INVALID_PASSWORD);
        }


        setErrors(errors);


        if (errors.length > 0) {
            return;
        }

//+611715114
        api.post('/auth/register', {
            name: name,
            phone: phone,
            password: password,
        }).then((res) => {
            const data = res.data as any;
            localStorage.setItem('token', data.accessToken);
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
                authStore.setUser(data.user);
            }
        }).catch((err) => {
            console.log(err);
        });
        navigate('/login');
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
                elevation={9}
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
                    Register
                </Typography>
                <TextField
                    label="Enter name"
                    variant="outlined"
                    type="name"
                    fullWidth
                    value={name}
                    error={errors.includes(typeError.NO_NAME)}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                />
                <TextField
                    label="Phone Number"
                    variant="outlined"
                    fullWidth
                    value={phone}
                    onChange={(e) => {
                        setPhone(e.target.value)
                    }}
                    error={errors.includes(typeError.NO_PHONE_NUMBER) || errors.includes(typeError.WRONG_PHONE_NUMBER)}
                    placeholder="Enter your phone number"
                />
                <TextField
                    label="Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={password}
                    error={errors.includes(typeError.INVALID_PASSWORD) || errors.includes(typeError.NO_PASSWORD)}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                />
                <TextField
                    label="Confirm Password"
                    variant="outlined"
                    type="password"
                    fullWidth
                    value={confirmPassword}
                    error={errors.includes(typeError.INVALID_PASSWORD)}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
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

                <Link component={RouterLink} to="/login" underline="hover" sx={{mt: 2, textAlign: 'center'}}>
                    You Already have account
                </Link>
            </Paper>
        </Box>
    );
};

export default RegisterForm;