import { useState } from "react";
import { match } from "ts-pattern";
import { useDebouncedCallback } from "use-debounce";
import {
    Context,
    TargetAction,
    useDeskproAppClient,
    useDeskproAppEvents,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { AppElementPayload, ReplyBoxSelection } from "../context/StoreProvider/types";
import { useStore } from "../context/StoreProvider/hooks";
import { deleteEntityIssueService } from "../services/entityAssociation";
import { baseRequest, checkIsAuthService } from "../services/github";
import { placeholders } from "../services/github/constants";
import {
    ticketReplyNotesSelectionStateKey,
    ticketReplyEmailsSelectionStateKey,
    registerReplyBoxNotesAdditionsTargetAction,
    registerReplyBoxEmailsAdditionsTargetAction,
} from "../utils/replyBox";
import { LogInPage } from "./LogIn";
import { HomePage } from "./HomePage";
import { LinkIssuePage } from "./LinkIssuePage";
import { ViewIssuePage } from "./ViewIssuePage";
import { EditIssuePage } from "./EditIssuePage";
import { AddCommentPage } from "./AddCommentPage";
import { ErrorBlock, Loading } from "../components/common";
import { Issue } from "../services/github/types";

export const Main = () => {
    const [state, dispatch] = useStore();
    const { client } = useDeskproAppClient();
    const [loading, setLoading] = useState<boolean>(false);

    if (state._error) {
        // eslint-disable-next-line no-console
        console.error(`GitHub: ${state._error}`);
    }

    useInitialisedDeskproAppClient((client) => {
        setLoading(true);

        checkIsAuthService(client)
            .then((isAuth) => dispatch({ type: "setAuth", isAuth }))
            .finally(() => setLoading(false));
    });

    useInitialisedDeskproAppClient((client) => {
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
    }, [state.isAuth]);

    useInitialisedDeskproAppClient((client) => {
        registerReplyBoxNotesAdditionsTargetAction(client, state);
        registerReplyBoxEmailsAdditionsTargetAction(client, state);
        client.registerTargetAction("githubOnReplyBoxNote", "on_reply_box_note");
        client.registerTargetAction("githubOnReplyBoxEmail", "on_reply_box_email");
    }, [state.issues, state.context?.data]);

    const debounceTargetAction = useDebouncedCallback<(a: TargetAction<ReplyBoxSelection[]>) => void>(
        (action: TargetAction) => {
            match<string>(action.name)
                .with("linkTicket", () => dispatch({ type: "changePage", page: "link_issue" }))
                .with("githubOnReplyBoxNote", () => {
                    const ticketId = action.subject;
                    const note = action.payload.note;

                    if (!ticketId || !note || !client) {
                        return;
                    }

                    if (ticketId !== state.context?.data.ticket.id) {
                        return;
                    }

                    client.setBlocking(true);
                    client.getState<ReplyBoxSelection>(`tickets/${ticketId}/github/notes/*`)
                        .then((r) => {
                            const commentUrls = r
                                .filter(({ data }) => data?.selected)
                                .map(({ data }) => data?.id)
                                .map((issueId) => (state.issues ?? []).find(({ id }) => issueId === id) as Issue)
                                .filter((issue) => !!issue)
                                .map(({ comments_url }) => comments_url);

                            return Promise.all(commentUrls.map((commentUrl) => baseRequest(client, {
                                rawUrl: commentUrl,
                                method: "POST",
                                data: {
                                    body: note,
                                },
                            })));
                        })
                        .then(() => dispatch({ type: "setIssue", issue: null }))
                        .finally(() => client.setBlocking(false))
                })
                .with("githubOnReplyBoxEmail", () => {
                    const ticketId = action.subject;
                    const email = action.payload.email;

                    if (!ticketId || !email || !client) {
                        return;
                    }

                    if (ticketId !== state.context?.data.ticket.id) {
                        return;
                    }

                    client.setBlocking(true);
                    client.getState<ReplyBoxSelection>(`tickets/${ticketId}/github/emails/*`)
                        .then((r) => {
                            const commentUrls = r
                                .filter(({ data }) => data?.selected)
                                .map(({ data }) => data?.id)
                                .map((issueId) => (state.issues ?? []).find(({ id }) => issueId === id) as Issue)
                                .filter((issue) => !!issue)
                                .map(({ comments_url }) => comments_url );

                            return Promise.all(commentUrls.map((commentUrl) => baseRequest(client, {
                                rawUrl: commentUrl,
                                method: "POST",
                                data: {
                                    body: email
                                }
                            })));
                        })
                        .then(() => dispatch({ type: "setIssue", issue: null }))
                        .finally(() => client.setBlocking(false))
                })
                .with("githubReplyBoxNoteAdditions", () => {
                    (action.payload ?? []).forEach((selection: { id: string; selected: boolean; }) => {
                        const ticketId = action.subject;

                        if (state.context?.data.ticket.id) {
                            client?.setState(
                                ticketReplyNotesSelectionStateKey(ticketId, selection.id),
                                { id: selection.id, selected: selection.selected }
                            ).then((result) => {
                                if (result.isSuccess) {
                                    registerReplyBoxNotesAdditionsTargetAction(client, state);
                                }
                            });
                        }
                    })
                })
                .with("githubReplyBoxEmailAdditions", () => {
                    (action.payload ?? []).forEach((selection: { id: string; selected: boolean; }) => {
                        const ticketId = action.subject;

                        if (state.context?.data.ticket.id) {
                            client?.setState(
                                ticketReplyEmailsSelectionStateKey(ticketId, selection.id),
                                { id: selection.id, selected: selection.selected }
                            ).then((result) => {
                                if (result.isSuccess) {
                                    registerReplyBoxEmailsAdditionsTargetAction(client, state);
                                }
                            });
                        }
                    })
                })
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
                dispatch({type: "setAuth", isAuth: false});
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
                        .then(() => {
                            return Promise.all([
                                client.deleteState(ticketReplyEmailsSelectionStateKey(payload.ticketId, payload.issueId)),
                                client.deleteState(ticketReplyNotesSelectionStateKey(payload.ticketId, payload.issueId)),
                            ])
                        })
                        .then(() => dispatch({ type: "unlinkIssue", issueId: payload.issueId }))
                        .then(() => dispatch({ type: "changePage", page: "home" }))
                }
            }

            match(type)
                .with("home_button", () => dispatch({ type: "setIssue", issue: null }))
                .otherwise(() => {});
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
            .with("edit_issue", () => <EditIssuePage />)
            .with("add_comment", () => <AddCommentPage />)
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
