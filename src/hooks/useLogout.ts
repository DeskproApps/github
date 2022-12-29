import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { placeholders } from "../services/github/constants";

const useLogout = () => {
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const [, dispatch] = useStore();

    const logout = useCallback(() => {
        if (!client) {
            return;
        }

        Promise.all([
            client?.deleteUserState(placeholders.CODE_PATH),
            client?.deleteUserState(placeholders.OAUTH_TOKEN_PATH),
        ])
            .then(() => {
                dispatch({type: "setAuth", isAuth: false});
                navigate("/log_in");
            })
            .catch((error) => dispatch({ type: "error", error }));
    }, [client, dispatch, navigate]);

    return { logout };
};

export { useLogout };
