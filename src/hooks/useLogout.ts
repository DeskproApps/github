import { useCallback } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { placeholders } from "../services/github/constants";

const useLogout = () => {
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
                dispatch({ type: "changePage", page: "log_in" });
            })
            .catch((error) => dispatch({ type: "error", error }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client]);

    return { logout };
};

export { useLogout };
