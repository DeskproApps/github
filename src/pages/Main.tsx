import { useState, useEffect } from "react";
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
import { deleteEntityIssueService } from "../services/entityAssociation";
import { baseRequest, checkIsAuthService } from "../services/github";
import { placeholders } from "../services/github/constants";
import { LogInPage } from "./LogIn";
import { HomePage } from "./HomePage";
import { LinkIssuePage } from "./LinkIssuePage";
import { ViewIssuePage } from "./ViewIssuePage";
import { ErrorBlock, Loading } from "../components/common";

export const Main = () => {
    const [state, dispatch] = useStore();
    const { client } = useDeskproAppClient();
    const [loading, setLoading] = useState<boolean>(false);

    if (state._error) {
        // eslint-disable-next-line no-console
        console.error(`GitHub: ${state._error}`);
    }

    useEffect(() => {
        if (!client) {
            return;
        }

        setLoading(true);

        checkIsAuthService(client)
            .then((isAuth) => dispatch({ type: "setAuth", isAuth }))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client]);

    useEffect(() => {
        if (!client) {
            return;
        }

        if (state.isAuth) {
            dispatch({ type: "changePage", page: "home" });
        } else {
            Promise.all([
                client.deleteUserState(placeholders.CODE_PATH),
                client.deleteUserState(placeholders.OAUTH_TOKEN_PATH),
            ])
                .then(() => dispatch({ type: "changePage", page: "log_in" }))
                .catch((error) => dispatch({ type: "error", error }));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isAuth]);

    const debounceTargetAction = useDebouncedCallback<(a: TargetAction<ReplyBoxNoteSelection[]>) => void>(
        (action: TargetAction) => {
            match<string>(action.name)
                .with("linkTicket", () => dispatch({ type: "changePage", page: "link_issue" }))
                .run();
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
        onElementEvent: (id: string, type: string, payload?: AppElementPayload) => {
            if (payload?.type === "changePage") {
                dispatch({type: "changePage", page: payload.page, params: payload.params})
            } else if (payload?.type === "logout") {
                dispatch({ type: "setAuth", isAuth: false });
            } else if (payload?.type === "unlinkTicket") {
                if (client) {
                    deleteEntityIssueService(client, payload.ticketId, payload.issueId)
                        .then(() => baseRequest(client, {
                            rawUrl: payload.commentsUrl,
                            method: "POST",
                            data: {
                                body: `Unlinked from Deskpro ticket ${payload.ticketId}${state.context?.data?.ticket?.permalinkUrl
                                    ? `, ${state.context.data.ticket.permalinkUrl}`
                                    : ""
                                }`
                            }
                        }))
                        .then(() => dispatch({ type: "changePage", page: "home" }))
                }
            }
        },
        onTargetAction: (a) => debounceTargetAction(a as TargetAction),
    }, [client]);

    const page = !state.isAuth
        ? <LogInPage />
        : match(state.page)
            .with("home", () => <HomePage />)
            .with("log_in", () => <LogInPage />)
            .with("link_issue", () => <LinkIssuePage />)
            .with("view_issue", () => <ViewIssuePage />)
            .otherwise(() => <LogInPage />);

    return loading
        ? (<Loading />)
        : (
            <>
                {state._error && (
                    <ErrorBlock text="An error occurred" />
                )}
                {page}
            </>
        );
};
