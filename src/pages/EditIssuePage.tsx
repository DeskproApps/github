import { FC, useEffect, useState, useCallback } from "react";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import {
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import {
    useSetAppTitle,
    useLoadDataDependencies,
} from "../hooks";
import { getEntityMetadata } from "../utils";
import { setEntityIssueService } from "../services/entityAssociation";
import { baseRequest } from "../services/github";
import { Issue, Repository, User } from "../services/github/types";
import { IssueForm } from "../components/IssueForm";
import { Loading, ErrorBlock } from "../components/common";

const EditIssuePage: FC = () => {
    const { loading: loadingData } = useLoadDataDependencies();
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState(loadingData);
    const [error, setError] = useState<string|null>(null);
    const repositories = state.dataDeps?.repositories as Repository[];
    const currentUser = state.dataDeps?.currentUser as User;
    const issueUrl = state.pageParams?.issueUrl;
    const ticketId = state.context?.data.ticket.id;

    useSetAppTitle("Edit");

    useInitialisedDeskproAppClient((client) => {
        client.deregisterElement("githubEditButton");
    });

    useEffect(() => {
        if (!client || !issueUrl) {
            return;
        }

        setLoading(true);

        (isEmpty(state.issue)
            ? baseRequest<Issue>(client, { rawUrl: issueUrl })
            : Promise.resolve(state.issue) as Promise<Issue>
        )
            .then((issue) => dispatch({ type: "setIssue", issue }))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, issueUrl]);

    const onCancel = useCallback(() => {
        dispatch({ type: "error", error: null });
        dispatch({
            type: "changePage",
            page: "view_issue",
            params: { issueUrl }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [issueUrl]);

    const onSubmit = useCallback((values) => {
        if (!client || !issueUrl) {
            return;
        }

        const updateIssue = {
            title: values.title,
            body: values.description,
            assignees: values.assignees,
            ...(values.milestone?.value ? { milestone: values.milestone.value } : {}),
        };

        dispatch({ type: "error", error: null });
        setError(null);

        return baseRequest<Issue>(client, {
            rawUrl: issueUrl,
            method: "PATCH",
            data: updateIssue,
        })
            .then((issue) => {
                return setEntityIssueService(
                    client,
                    ticketId,
                    issue.id,
                    getEntityMetadata({
                        ...issue,
                        repository_name: values?.repository?.value || "",
                    })
                ).then(() => issue);
            })
            .then((issue) => dispatch({ type: "setIssue", issue }))
            .then(() => dispatch({
                type: "changePage",
                page: "view_issue",
                params: { issueUrl }
            }))
            .catch((error) => {
                if (error.code === 403) {
                    setError(get(error, ["message"], "Must have admin rights to Repository."));
                } else {
                    dispatch({ type: "error", error });
                }
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [client, issueUrl]);

    return loading
        ? (<Loading />)
        : (
            <>
                {error && <ErrorBlock text={error} />}
                <IssueForm
                    issue={state.issue}
                    repositories={repositories}
                    currentUser={currentUser}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                />
            </>
        );
};

export { EditIssuePage };
