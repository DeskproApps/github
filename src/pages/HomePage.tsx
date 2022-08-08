import { Fragment, FC, useState, useEffect } from "react";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import {
    HorizontalDivider,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { ClientStateIssue } from "../context/StoreProvider/types";
import { getEntityCardListService } from "../services/entityAssociation";
import { Issue } from "../services/github/types";
import { baseRequest } from "../services/github";
import { useSetAppTitle, useSetBadgeCount } from "../hooks";
import { Loading, IssueInfo, NoFound } from "../components/common";

const HomePage: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
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

        const loadIssues = (issueIds: Array<Issue["id"] | string>) => {
            Promise.all(issueIds.map((issueId) =>
                client.getState<ClientStateIssue>(`issues/${issueId}`)
            ))
                .then((linkedIssueIds) => {
                    return Promise.all(linkedIssueIds.map((linkedIssue) => {
                        return baseRequest<Issue>(client, { rawUrl: linkedIssue[0].data?.issueUrl })
                    }))
                })
                .then((issues) => {
                    dispatch({
                        type: "setIssues",
                        issues: issues.filter((issue) => !isEmpty(issue)) as Issue[],
                    });
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
        dispatch({
            type: "changePage",
            page: "view_issue",
            params: {
                issueUrl: url,
            },
        });
    };

    return loading
        ? (<Loading/>)
        : (
            <>
                {(isArray(state.issues) && !isEmpty(state.issues))
                    ? state.issues.map((issue) => (
                        <Fragment key={issue.id} >
                            <IssueInfo
                                {...issue}
                                onClick={onClickTitle(issue.url)}
                            />
                            <HorizontalDivider style={{ marginBottom: 9 }}/>
                        </Fragment>
                    ))
                    : <NoFound />
                }
            </>
        );
};

export { HomePage };
