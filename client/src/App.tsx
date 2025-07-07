import LoginForm from "./components/LoginForm.tsx";
import { Link} from "@mui/material";
import { Route, Routes, Link as RouterLink } from "react-router-dom";
import HomePage from "./components/HomePage.tsx";
import RegisterForm from "./components/RegisterForm.tsx";
import UserInfo from "./components/UserInfo.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./components/ChatPage.tsx";

function App() {

  return (
    <>
        <Routes>
            <Route path="/user-info" element={<ProtectedRoute><UserInfo/></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage/></ProtectedRoute>} />
            <Route path="/login" element={ <LoginForm/> } />
            <Route path="/register" element={ <RegisterForm/> } />
        </Routes>

    </>
  )
}

export default App;
