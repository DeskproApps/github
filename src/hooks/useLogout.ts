import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { placeholders } from "../services/github/constants";

type UseLogout = () => {
    isLoading: boolean,
    logout: () => void,
};

const useLogout: UseLogout = () => {
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const [, dispatch] = useStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const logout = useCallback(() => {
        if (!client) {
            return;
        }

        setIsLoading(true);

        Promise.all([
            client?.deleteUserState(placeholders.CODE_PATH),
            client?.deleteUserState(placeholders.OAUTH_TOKEN_PATH),
        ])
            .then(() => {
                dispatch({type: "setAuth", isAuth: false});
                client.setBadgeCount(0);
                navigate("/log_in");
            })
            .catch((error) => dispatch({ type: "error", error }))
            .finally(() => setIsLoading(false));
    }, [client, dispatch, navigate]);

    return { logout, isLoading };
};

export { useLogout };
