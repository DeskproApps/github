import { useEffect } from "react";
import { match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import {
    Context,
    TargetAction,
    useDeskproAppClient,
    useDeskproAppEvents,
} from "@deskpro/app-sdk";
import { AppElementPayload, ReplyBoxNoteSelection } from "../context/StoreProvider/types";
import { useStore } from "../context/StoreProvider/hooks";
import { placeholders } from "../services/github/constants";
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

    const debounceTargetAction = useDebouncedCallback<(a: TargetAction<ReplyBoxNoteSelection[]>) => void>(
        (action: TargetAction) => {
            match<string>(action.name)
                .with("linkTicket", () => dispatch({ type: "changePage", page: "add_issue" }))
                .run()
            ;
        },
        500,
    );

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
            } else if (payload?.type === "logout") {
                if (client) {
                    client.deleteUserState(placeholders.OAUTH_TOKEN_PATH)
                        .then(() => dispatch({ type: "setAuth", isAuth: false }))
                        .catch((error) => dispatch({ type: "error", error }));
                }
            }
        },
        onTargetAction: (a) => debounceTargetAction(a as TargetAction),
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
