// import { useNavigate } from "react-router-dom";
import {
    LoadingSpinner,
    // useDeskproLatestAppContext,
    // useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
// import { useStore } from "../context/StoreProvider/hooks";
// import { checkIsAuthService } from "../services/github";
import { Container } from "../components/common";
import { Button } from "@deskpro/deskpro-ui";
import { useEffect, useState } from "react";

export const Main = () => {
    // const { context } = useDeskproLatestAppContext()
    // console.log("Context Data: ", context?.data)
    const [errorState, setErrorState] = useState<string | null>(null)
    // const navigate = useNavigate();
    // const [, dispatch] = useStore();

    useEffect(() => {
        if (errorState === "left") {
            throw new Error("hello")
        }

        if (errorState === "right") {
            throw "HI"
        }



    }, [errorState])

    // throw "String" 

    // useInitialisedDeskproAppClient((client) => {
    //     checkIsAuthService(client)
    //         .then((isAuth) => {
    //             dispatch({ type: "setAuth", isAuth })
    //             navigate(isAuth ? "/home" : "/log_in")
    //         })
    // });

    return (
        <Container>
            <Button
                text="Left Error"
                onClick={() => { setErrorState("left") }}
            />
            <Button
                text="Right Error"
                onClick={() => { setErrorState("right") }}
            />
            <LoadingSpinner />
        </Container>
    );
};
