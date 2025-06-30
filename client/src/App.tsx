import LoginForm from "./components/LoginForm.tsx";
import { Link} from "@mui/material";
import { Route, Routes, Link as RouterLink } from "react-router-dom";
import HomePage from "./components/HomePage.tsx";
import RegisterForm from "./components/RegisterForm.tsx";

function App() {

  return (
    <>
        <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/login" element={ <LoginForm/> } />
            <Route path="/register" element={ <RegisterForm/> } />
        </Routes>

    </>
  )
}

export default App;
