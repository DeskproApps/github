import { Fragment, FC, useState, useEffect } from "react";
import {
    HorizontalDivider,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { ClientStateIssue } from "../context/StoreProvider/types";
import { getEntityCardListService } from "../services/entityAssociation";
import { Issue } from "../services/github/types";
import { baseRequest } from "../services/github";
import { useSetAppTitle } from "../hooks";
import { Loading, IssueInfo } from "../components/common";

const HomePage: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [issues, setIssues] = useState<Issue[]>([]);
    const ticketId = state.context?.data.ticket.id;

    useSetAppTitle("GitHub Issues");

    useEffect(() => {
        if (!client) {
            return;
        }

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

        const loadIssues = () => {
            client.getState<ClientStateIssue>(`issues/*`)
                .then((issues) => {
                    return Promise.all(issues.map((issueState) => {
                        return baseRequest<Issue>(client, { rawUrl: issueState.data?.issueUrl });
                    }));
                })
                .then((issues) => setIssues(issues));
        };

        getEntityCardListService(client, ticketId)
            .then((issueIds) => {
                if (Array.isArray(issueIds) && issueIds.length > 0) {
                    return loadIssues();
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
                {issues.map((issue) => (
                    <Fragment key={issue.id} >
                        <IssueInfo
                            {...issue}
                            onClick={onClickTitle(issue.url)}
                        />
                        <HorizontalDivider style={{ marginBottom: 9 }}/>
                    </Fragment>
                ))}
            </>
        );
};

export { HomePage };
