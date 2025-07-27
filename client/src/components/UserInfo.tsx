import {observer} from "mobx-react-lite";
import {authStore} from "../store/authStore";
import {useNavigate} from "react-router-dom";
import Button from "@mui/material/Button";
import LogoutIcon from '@mui/icons-material/Logout';
const UserInfo = observer(() => {
    const navigate = useNavigate();
    if (!authStore.isAuth || !authStore.user) {
        return <div>Not logged in</div>;
    }

    function onLogout() {
        authStore.logout();
        navigate('/login');
    }

    return (
        <div>
            <h2>User Info</h2>
            <p><b>Name:</b> {authStore.user.name}</p>
            <p><b>Phone:</b> {authStore.user.phone}</p>
            {/*<p><b>Status:</b> {authStore.user.status}</p>*/}
            <Button onClick={onLogout}><LogoutIcon/>Log out</Button>
        </div>
    );
});

export default UserInfo;
