import LoginForm from "./components/LoginForm.tsx";
import { Route, Routes} from "react-router-dom";
import RegisterForm from "./components/RegisterForm.tsx";
import UserInfo from "./components/UserInfo.tsx";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./components/ChatPage.tsx";
import {MainPage} from "./components/MainPage.tsx";

function App() {

  return (
    <>
        <Routes>
            <Route path="/user-info" element={<ProtectedRoute><UserInfo/></ProtectedRoute>} />
            <Route path='/' element={<ProtectedRoute><MainPage/></ProtectedRoute>}/>
            <Route path="/chat" element={<ProtectedRoute><ChatPage/></ProtectedRoute>} />
            <Route path="/login" element={ <LoginForm/> } />
            <Route path="/register" element={ <RegisterForm/> } />
        </Routes>

    </>
  )
}

export default App;
