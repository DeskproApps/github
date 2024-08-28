import { useNavigate } from "react-router-dom";
import {
    LoadingSpinner,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { checkIsAuthService } from "../services/github";
import { Container } from "../components/common";

export const Main = () => {
    const navigate = useNavigate();
    const [, dispatch] = useStore();

    useInitialisedDeskproAppClient((client) => {
        checkIsAuthService(client)
            .then((isAuth) => {
                dispatch({ type: "setAuth", isAuth })
                navigate(isAuth ? "/home" : "/log_in")
            })
    });

    return (
        <Container>
            <LoadingSpinner/>
        </Container>
    );
};
