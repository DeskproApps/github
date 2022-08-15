import { Fragment, FC, useState, useEffect } from "react";
import {
    HorizontalDivider,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { ClientStateIssue } from "../context/StoreProvider/types";
import { getEntityCardListService } from "../services/entityAssociation";
import { Issue, IssueGQL } from "../services/github/types";
import {
    baseRequest,
    getIssueUrl,
    getIssuesByIdsGraphQLService,
} from "../services/github";
import { useSetAppTitle, useSetBadgeCount } from "../hooks";
import { isBaseUrl } from "../utils";
import { Loading, IssueInfo } from "../components/common";

const HomePage: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [issues, setIssues] = useState<IssueGQL[]>([]);
    const ticketId = state.context?.data.ticket.id;

    useSetAppTitle("GitHub Issues");
    useSetBadgeCount(state.issues ?? []);

    useEffect(() => {
        if (!client) {
            return;
        }

        client.deregisterElement("githubHomeButton");
        client.deregisterElement("githubEditButton");

        client?.registerElement("githubPlusButton", {
            type: "plus_button",
            payload: { type: "changePage", page: "link_issue" },
        });
        client?.registerElement("githubMenu", {
            type: "menu",
            items: [{
                title: "Log Out",
                payload: { type: "logout" },
            }],
        });
    }, [client]);

    useEffect(() => {
        if (!ticketId || !client) {
            return;
        }

        setLoading(true);

        const loadIssues = (linkedIssueIds: string[]) => {
            client.getState<ClientStateIssue>(`issues/*`)
                .then((issues) => {
                    const nodeIds: string[] = [];
                    const issueUrls: string[] = [];

                    issues.forEach((issue) => {
                        if (!linkedIssueIds.some((issueId) => issue.name === `issues/${issueId}`)) {
                            return;
                        }

                        if (issue.data?.nodeId) {
                            nodeIds.push(issue.data.nodeId);
                        }

                        if (!issue.data?.nodeId && isBaseUrl(issue.data?.issueUrl)) {
                            issueUrls.push(issue.data?.issueUrl as string);
                        }
                    });

                    return Promise.
                        all(issueUrls.map((issueUrl) => {
                            return baseRequest<Issue>(client, { rawUrl: issueUrl })
                        }))
                        .then((issues) => {
                            issues.forEach(({ node_id }) => {
                                nodeIds.push(node_id)
                            });
                            return nodeIds
                        });
                })
                .then((nodeIds) => getIssuesByIdsGraphQLService(client, nodeIds))
                .then((issues) => {
                    setIssues(issues);
                    dispatch({ type: "setIssues", issues });
                });
        };

        getEntityCardListService(client, ticketId)
            .then((issueIds) => {
                if (Array.isArray(issueIds) && issueIds.length > 0) {
                    return loadIssues(issueIds);
                } else {
                    dispatch({ type: "changePage", page: "link_issue" })
                }
            })
            .catch((error) => dispatch({ type: "error", error }))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, ticketId]);

    const onClickTitle = (url: Issue["url"]) => () => {
        dispatch({ type: "setIssue", issue: null });
        dispatch({
            type: "changePage",
            page: "view_issue",
            params: {
                issueUrl: getIssueUrl(url),
            },
        });
    };

    return loading
        ? (<Loading/>)
        : (
            <>
                {issues.map((issue) => (
                    <Fragment key={issue.id} >
                        <IssueInfo
                            {...issue}
                            onClick={onClickTitle(issue.resourcePath)}
                        />
                        <HorizontalDivider style={{ marginBottom: 9 }}/>
                    </Fragment>
                ))}
            </>
        );
};

export { HomePage };
