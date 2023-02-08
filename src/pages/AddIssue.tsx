import { useState, useEffect, useCallback } from "react";
import get from "lodash/get";
import flow from "lodash/flow";
import isEmpty from "lodash/isEmpty";
import { useDebouncedCallback } from "use-debounce";
import { match } from "ts-pattern";
import { useNavigate } from "react-router-dom";
import {
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { ClientStateIssue } from "../context/StoreProvider/types";
import {
    setEntityIssueService,
    getEntityCardListService,
} from "../services/entityAssociation";
import { searchByIssueGraphQLService } from "../services/github";
import { IssueGQL } from "../services/github/types";
import {
    useLogout,
    useDeskproLabel,
    useAutomatedComment,
} from "../hooks";
import {
    getEntityMetadata,
    createSearchQuery,
    getRepoOptionsFromIssues,
} from "../utils";
import { LinkIssue } from "../components/LinkIssue";
import type { FC, ChangeEvent } from "react";
import type { OptionRepository, FilterValues } from "../components/LinkIssue/types";
import type { Filters } from "../utils/createSearchQuery";

const filterByRepo = (selectedRepo?: string) => (issues: IssueGQL[]) => {
    return issues.filter(({ repository }) => ["any", repository.nameWithOwner].includes(selectedRepo || ""))
}

const filterByAlreadySelected = (alreadyLinkedIssues: string[]) => (issues: IssueGQL[]) => {
    return issues.filter(({ databaseId }) => !alreadyLinkedIssues.includes(`${databaseId}`));
};

const AddIssue: FC = () => {
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchIssue, setSearchIssue] = useState<string>("");
    const [issues, setIssues] = useState<IssueGQL[]>([]);
    const [repoOptions, setRepoOptions] = useState<Array<OptionRepository>>([]);
    const [selectedRepo, setSelectedRepo] = useState<OptionRepository|null>(null);
    const [selectedIssues, setSelectedIssues] = useState<Array<IssueGQL["id"]>>([]);
    const [alreadyLinkedIssues, setAlreadyLinkedIssues] = useState<string[]>([]);
    const [filters, setFilters] = useState<Filters>({});
    const { logout } = useLogout();
    const { createAutomatedLinkedComment } = useAutomatedComment();
    const { addDeskproLabel } = useDeskproLabel();
    const ticketId = state.context?.data.ticket.id;
    const currentUserLogin = get(state, ["dataDeps", "currentUser", "login"]);

    useInitialisedDeskproAppClient((client) => {
        if (!ticketId) {
            return;
        }

        getEntityCardListService(client, ticketId)
            .then(setAlreadyLinkedIssues)
            .catch(() => setAlreadyLinkedIssues([]));
    }, [ticketId]);

    useEffect(() => {
        if (!isEmpty(repoOptions) && !isEmpty(repoOptions[0])) {
            setSelectedRepo(repoOptions[0]);
        }
    }, [repoOptions]);

    useEffect(() => {
        setRepoOptions([
            { key: "any", label: "Any", type: "value", value: "any" },
            ...getRepoOptionsFromIssues(issues),
        ]);
    }, [issues]);

    const onClearSearch = () => {
        setSearchIssue("");
        setIssues([]);
        setSelectedRepo(repoOptions[0]);
    };

    const onChangeSelectedCard = (issueId: IssueGQL["id"]) => {
        let newSelectedIssues = [...selectedIssues];

        if (selectedIssues.includes(issueId)) {
            newSelectedIssues = selectedIssues.filter((selectedIssueId) => selectedIssueId !== issueId);
        } else {
            newSelectedIssues.push(issueId);
        }
        setSelectedIssues(newSelectedIssues);
    };

    const searchInGithub = useDebouncedCallback<(q: string, filters: Filters) => void>((q, filters) => {
        if (!client || !currentUserLogin) {
            return;
        }

        if (!q || q.length < 2) {
            setIssues([]);
            setRepoOptions([{ key: "any", label: "Any", type: "value", value: "any" }]);
            return;
        }

        setLoading(true);

        searchByIssueGraphQLService(client, createSearchQuery(q, filters))
            .then(setIssues)
            .catch((error) => {
                let isErrorInsufficientScopes = false;

                if (error?.code === 401) {
                    dispatch({ type: "setAuth", isAuth: false });
                }

                if (Array.isArray(error) && error.length > 0) {
                    error.forEach(({ type }) => {
                        match(type)
                            .with("INSUFFICIENT_SCOPES", () => {
                                if (!isErrorInsufficientScopes) {
                                    isErrorInsufficientScopes = true;
                                }
                            })
                            .run();
                    });
                }

                if (isErrorInsufficientScopes) {
                    logout();
                }
            })
            .finally(() => setLoading(false));
    }, 500);

    const onChangeSearch = ({ target: { value: q }}: ChangeEvent<HTMLInputElement>) => {
        setSearchIssue(q);
    };

    const onChangeSelectedRepo = (option: OptionRepository) => {
        setSelectedRepo(option);
    };

    const onLinkIssues = () => {
        if (!client || !ticketId) {
            return;
        }

        const linkedIssues = issues.filter(({ id }) => selectedIssues.includes(id));

        setIsSubmitting(true);

        Promise.all([
            ...linkedIssues.map((issue) => setEntityIssueService(
                client,
                ticketId,
                issue.databaseId,
                getEntityMetadata(issue),
            )),
            ...linkedIssues.map((issue) => {
                return client.setState<ClientStateIssue>(
                    `issues/${issue.databaseId}`,
                    { issueUrl: issue.resourcePath, nodeId: issue.id },
                );
            }),
            ...linkedIssues.map((issue) => {
                return createAutomatedLinkedComment({
                    repoFullName: issue.repository.nameWithOwner,
                    issueNumber: issue.number,
                });
            }),
            ...linkedIssues.map((issue) => addDeskproLabel(issue))
        ])
        .then(() => navigate("/home"))
        .catch((error) => dispatch({ type: "error", error }))
        .finally(() => setIsSubmitting(false));
    };

    const onCancel = useCallback(() => navigate("/home"), [navigate]);

    const onChangeFilter = (values: FilterValues) => {
        setFilters({ ...values, login: currentUserLogin });
    };

    useEffect(() => {
        searchInGithub(searchIssue, filters);
    }, [searchIssue, filters, searchInGithub]);

    return (
        <LinkIssue
            loading={loading}
            issues={flow([
                filterByRepo(selectedRepo?.value),
                filterByAlreadySelected(alreadyLinkedIssues),
            ])(issues)}
            selectedIssues={selectedIssues}
            onCancel={onCancel}
            onChangeSelectedCard={onChangeSelectedCard}
            onLinkIssues={onLinkIssues}
            selectedRepo={selectedRepo}
            isSubmitting={isSubmitting}
            repoOptions={repoOptions}
            onChangeSelectedRepo={onChangeSelectedRepo}
            searchIssue={searchIssue}
            onClearSearch={onClearSearch}
            onChangeSearch={onChangeSearch}
            onChangeFilter={onChangeFilter}
        />
    );
};

export { AddIssue };
