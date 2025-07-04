import {observer} from "mobx-react-lite";
import {authStore} from "../store/authStore";
import {useNavigate} from "react-router-dom";

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
            <p><b>ID:</b> {authStore.user.id}</p>
            <p><b>Name:</b> {authStore.user.name}</p>
            <p><b>Phone:</b> {authStore.user.phone}</p>
            <p><b>Status:</b> {authStore.user.status}</p>
            <button onClick={onLogout}>Log out</button>
        </div>
    );
});

export default UserInfo;
