import { useEffect, Suspense } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { match } from "ts-pattern";
import {
    Context,
    TargetAction,
    LoadingSpinner,
    useDeskproElements,
    useDeskproAppClient,
    useDeskproAppEvents,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import {
    AppElementPayload,
    ReplyBoxSelection,
} from "./context/StoreProvider/types";
import { useStore } from "./context/StoreProvider/hooks";
import { baseRequest, getIssueCommentUrl } from "./services/github";
import { useLogout, useUnlinkIssue } from "./hooks";
import {
    ticketReplyNotesSelectionStateKey,
    ticketReplyEmailsSelectionStateKey,
    registerReplyBoxNotesAdditionsTargetAction,
    registerReplyBoxEmailsAdditionsTargetAction,
} from "./utils/replyBox";
import { LogInPage } from "./pages/LogIn";
import { HomePage } from "./pages/HomePage";
import { LinkIssuePage } from "./pages/LinkIssuePage";
import { ViewIssuePage } from "./pages/ViewIssuePage";
import { EditIssuePage } from "./pages/EditIssuePage";
import { AddCommentPage } from "./pages/AddCommentPage";
import { AdminPage } from "./pages/AdminPage";
import { Main } from "./pages/Main";
import { ErrorBlock, Loading, AppContainer } from "./components/common";
import { IssueGQL } from "./services/github/types";

const App = () => {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [state, dispatch] = useStore();
    const { client } = useDeskproAppClient();
    const { logout, isLoading: isLoadingLogout } = useLogout();
    const { unlinkIssue, isLoading: isLoadingUnlink } = useUnlinkIssue();
    const isAdmin = pathname.includes("/admin/");

    const isLoading = [
        isLoadingUnlink,
        isLoadingLogout,
    ].some((isLoading) => isLoading);

    if (state._error) {
        // eslint-disable-next-line no-console
        console.error(`GitHub: ${state._error}`);
    }

    useEffect(() => {
        if (state.isAuth) {
            navigate("/home");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.isAuth]);

    useDeskproElements(({ registerElement }) => {
        registerElement("refresh", { type: "refresh_button" });
    });

    useInitialisedDeskproAppClient((client) => {
        registerReplyBoxNotesAdditionsTargetAction(client, state);
        registerReplyBoxEmailsAdditionsTargetAction(client, state);
        client.registerTargetAction("githubOnReplyBoxNote", "on_reply_box_note");
        client.registerTargetAction("githubOnReplyBoxEmail", "on_reply_box_email");
    }, [state.issues, state.context?.data]);

    const debounceTargetAction = useDebouncedCallback<(a: TargetAction<ReplyBoxSelection[]>) => void>(
        (action: TargetAction) => {
            dispatch({ type: "error", error: null });

            match<string>(action.name)
                .with("linkTicket", () => navigate("/link_issue"))
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
                                .map((issueId) => (state.issues ?? []).find(({ id }) => issueId === id.toLowerCase()) as IssueGQL)
                                .filter((issue) => !!issue)
                                .map(({ repository, number }) => getIssueCommentUrl(repository.nameWithOwner, number) );

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
                                .map((issueId) => (state.issues ?? []).find(({ id }) => issueId === id.toLowerCase()) as IssueGQL)
                                .filter((issue) => !!issue)
                                .map(({ repository, number }) => getIssueCommentUrl(repository.nameWithOwner, number) );

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
                                } else if (!result.isSuccess && result.errors.length) {
                                    dispatch({ type: "error", error: result.errors });
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
                                } else if (!result.isSuccess && result.errors.length) {
                                    dispatch({ type: "error", error: result.errors });
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
                navigate(payload.params);
            } else if (payload?.type === "logout") {
                logout();
            } else if (payload?.type === "unlinkTicket") {
                unlinkIssue(payload);
            }

            match(type)
                .with("home_button", () => dispatch({ type: "setIssue", issue: null }))
                .otherwise(() => {});
        },
        onTargetAction: (a) => debounceTargetAction(a as TargetAction),
    }, [client, unlinkIssue, logout]);

    if (isLoading) {
        return (
            <LoadingSpinner/>
        );
    }

    return (
        <AppContainer isAdmin={isAdmin}>
            {state._error ? <ErrorBlock /> : ""}
            <Suspense fallback={<Loading />}>
                <ErrorBoundary fallbackRender={() => (<ErrorBlock text="An error occurred..." />)}>
                    <Routes>
                        <Route path="/admin/callback" element={<AdminPage/>} />
                        <Route path="/home" element={<HomePage />} />
                        <Route path="/log_in" element={<LogInPage />} />
                        <Route path="/link_issue" element={<LinkIssuePage />} />
                        <Route path="/view_issue" element={<ViewIssuePage />} />
                        <Route path="/edit_issue" element={<EditIssuePage />} />
                        <Route path="/add_comment" element={<AddCommentPage />} />
                        <Route index element={<Main />} />
                    </Routes>
                </ErrorBoundary>
            </Suspense>
        </AppContainer>
    );
}

export default App;
