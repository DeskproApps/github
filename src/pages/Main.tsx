import { useEffect } from "react";
import { match } from "ts-pattern";
import {
    Context,
    useDeskproAppClient,
    useDeskproAppEvents,
} from "@deskpro/app-sdk";
import { AppElementPayload } from "../context/StoreProvider/types";
import { useStore } from "../context/StoreProvider/hooks";
import { LogInPage } from "./LogIn";
import { HomePage } from "./Home";
import { AddIssuePage } from "./AddIssue";
import { ErrorBlock } from "../components/common";

export const Main = () => {
    const [state, dispatch] = useStore();
    const { client } = useDeskproAppClient();

    if (state._error) {
        console.error(`Trello: ${state._error}`);
    }

    useDeskproAppEvents({
        onShow: () => {
            client && setTimeout(() => client.resize(), 200);
        },
        onChange: (context: Context) => {
            context && dispatch({ type: "loadContext", context });
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        onElementEvent(id: string, type: string, payload?: AppElementPayload) {
            if (payload?.type === "changePage") {
                dispatch({type: "changePage", page: payload.page, params: payload.params})
            }
        },
    });

    useEffect(() => {
        dispatch({ type: "changePage", page: !state.isAuth ? "log_in" : "home" });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isAuth]);

    const page = !state.isAuth
        ? <LogInPage />
        : match(state.page)
            .with("home", () => <HomePage />)
            .with("log_in", () => <LogInPage />)
            .with("add_issue", () => <AddIssuePage />)
            .otherwise(() => <LogInPage />);

    return (
        <>
            {state._error && (
                <ErrorBlock text="An error occurred" />
            )}
            {page}
        </>
    );
};
