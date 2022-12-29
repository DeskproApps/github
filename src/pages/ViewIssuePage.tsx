import { FC, useEffect, useState, useCallback } from "react";
import isEmpty from "lodash/isEmpty";
import { useSearchParams, useNavigate, createSearchParams } from "react-router-dom";
import {
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import {
    baseRequest,
    getLinkedPRsToIssue,
    getIssueByIdGraphQLService,
} from "../services/github";
import { Issue, Repository, Comments, User, ProjectGQL, PullRequest } from "../services/github/types";
import { getUniqUsersLogin } from "../utils";
import { ViewIssue } from "../components/ViewIssue";
import { Loading } from "../components/common";

const ViewIssuePage: FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [repository, setRepository] = useState<Repository|null>(null);
    const [users, setUsers] = useState<Record<User["id"], User>>({});
    const [comments, setComments] = useState<Comments>([]);
    const [projects, setProjects] = useState<ProjectGQL[]>([]);
    const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);

    const issueUrl = searchParams.get("issueUrl");

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

        client.deregisterElement("githubHomeButton");
        client.deregisterElement("githubPlusButton");
        client.deregisterElement("githubMenu");
        client.deregisterElement("githubEditButton");

        client.registerElement("githubHomeButton", {
            type: "home_button",
            payload: { type: "changePage", params: "/home" }
        });

    }, [client]);

    useEffect(() => {
        if (!client || !issueUrl) {
            return;
        }

        client?.registerElement("githubEditButton", {
            type: "edit_button",
            payload: {
                type: "changePage",
                params: {
                    pathname: "/edit_issue",
                    search: `?${createSearchParams([["issueUrl", issueUrl]])}`,
                }
            },
        });
    }, [client, issueUrl]);

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

    useEffect(() => {
        if (!client || !state.issue?.number || !repository?.name || !repository?.owner.login) {
            return;
        }

        getLinkedPRsToIssue(client, repository.owner.login, repository.name, state.issue.number)
            .then(setPullRequests)
            .catch(() => {});
    }, [client, state.issue?.number, repository?.name, repository?.owner.login]);

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
                        getIssueByIdGraphQLService(client, issue.node_id)
                    ])
                })
                .then(([issue, repository, comments, { projects }]) => {
                    const sortedComments = comments.sort((a, b) => {
                        const timestampFirst = (new Date(a.created_at)).getTime();
                        const timestampSecond = (new Date(b.created_at)).getTime();
                        return timestampSecond - timestampFirst;
                    });

                    setRepository(repository);
                    setComments(sortedComments);
                    setProjects(projects);

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

    const onAddNewComment = useCallback(() => {
        if (repository?.full_name && state.issue?.comments_url && issueUrl) {
            navigate({
                pathname: "/add_comment",
                search: `?${createSearchParams([
                    ["issueUrl", issueUrl],
                    ["repoFullName", repository?.full_name],
                    ["commentUrl", state.issue?.comments_url],
                ])}`
            });
        }
    }, [navigate, issueUrl, repository?.full_name, state.issue?.comments_url]);

    return loading
        ? (<Loading/>)
        : (state.issue && repository)
        ? (
            <ViewIssue
                issue={state.issue}
                users={users}
                comments={comments}
                repository={repository}
                projects={projects}
                onAddNewComment={onAddNewComment}
                pullRequests={pullRequests}
            />
        )
        : null;
};

export { ViewIssuePage };
