import LoginForm from "./components/LoginForm.tsx";
import { Link} from "@mui/material";
import { Route, Routes, Link as RouterLink } from "react-router-dom";

function App() {


  return (
    <>
        <Routes>
            <Route path="/login" element={ <LoginForm/> } />
        </Routes>
        <LoginForm/>
    </>
  )
}

export default App
