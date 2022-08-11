import { FC, useEffect, useState } from "react";
import isEmpty from "lodash/isEmpty";
import {
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { baseRequest } from "../services/github";
import { Issue, Repository, Comments, User } from "../services/github/types";
import { getUniqUsersLogin } from "../utils";
import { ViewIssue } from "../components/ViewIssue";
import { Loading } from "../components/common";

const ViewIssuePage: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [repository, setRepository] = useState<Repository|null>(null);
    const [users, setUsers] = useState<Record<User["id"], User>>({});
    const [comments, setComments] = useState<Comments>([]);
    const issueUrl = state.pageParams?.issueUrl;

    useEffect(() => {
        if (!client || !state.issue?.number) {
            return;
        }

        client.setTitle(`${state.issue.number}`);
    }, [client, state.issue?.number]);

    useEffect(() => {
        if (!client) {
            return;
        }

        client.deregisterElement("githubPlusButton");
        client.deregisterElement("githubMenu");
        client.deregisterElement("githubEditButton");

        client.registerElement("githubHomeButton", {
            type: "home_button",
            payload: { type: "changePage", page: "home" }
        });

    }, [client]);

    useEffect(() => {
        if (!client || !state.pageParams?.issueUrl) {
            return;
        }

        client?.registerElement("githubEditButton", {
            type: "edit_button",
            payload: {
                type: "changePage",
                page: "edit_issue",
                params: { issueUrl: state.pageParams.issueUrl }
            },
        });
    }, [client, state.pageParams?.issueUrl]);

    useEffect(() => {
        if (!client || !state.context?.data.ticket.id || !state.issue?.id || !state.issue.comments_url) {
            return;
        }

        client.registerElement("githubMenu", {
            type: "menu",
            items: [{
                title: "Unlink Ticket",
                payload: {
                    type: "unlinkTicket",
                    issueId: state.issue.id,
                    commentsUrl: state.issue.comments_url,
                    ticketId: state.context.data.ticket.id,
                },
            }],
        });
    }, [client, state.context?.data.ticket.id, state.issue?.id, state.issue?.comments_url]);

    useInitialisedDeskproAppClient((client) => {
        if (issueUrl) {
            setLoading(true);


            (isEmpty(state.issue)
                ? baseRequest<Issue>(client, { rawUrl: issueUrl })
                : Promise.resolve(state.issue) as Promise<Issue>
            )
                .then((issue) => {
                    dispatch({ type: "setIssue", issue });

                    return Promise.all([
                        Promise.resolve<Issue>(issue),
                        baseRequest<Repository>(client, { rawUrl: issue.repository_url }),
                        // ToDo: recursively get comments while exists
                        baseRequest<Comments>(client, {
                            rawUrl: issue.comments_url,
                            queryParams: {
                                per_page: 100,
                            },
                        }),
                    ])
                })
                .then(([issue, repository, comments]) => {
                    setRepository(repository);
                    setComments(comments);

                    const users = getUniqUsersLogin(issue.user, issue.assignee, issue.assignees);

                    return Promise.all(
                        users.map((userLogin) =>
                            baseRequest<User>(client, { rawUrl: `https://api.github.com/users/${userLogin}` })
                        )
                    );
                })
                .then((users) => {
                    setUsers(users.reduce((acc: Record<User["id"], User>, user: User) => {
                        if (!acc[user.id]) {
                            acc[user.id] = user;
                        }

                        return acc;
                    }, {}));
                })
                .finally(() => setLoading(false));
        }
    }, [issueUrl, state.issue]);

    const onAddNewComment = () => {
        dispatch({
            type: "changePage",
            page: "add_comment",
            params: {
                issueUrl,
                repoFullName: repository?.full_name,
                commentUrl: state.issue?.comments_url,
            },
        });
    };

    return loading
        ? (<Loading/>)
        : (state.issue && repository)
        ? (
            <ViewIssue
                issue={state.issue}
                users={users}
                comments={comments}
                repository={repository}
                onAddNewComment={onAddNewComment}
            />
        )
        : null;
};

export { ViewIssuePage };
