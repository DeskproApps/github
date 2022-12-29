import { useState, FC, ChangeEvent, useEffect } from "react";
import flow from "lodash/flow";
import isEmpty from "lodash/isEmpty";
import { useDebouncedCallback } from "use-debounce";
import { match } from "ts-pattern";
import { useNavigate } from "react-router-dom";
import {
    Stack,
    HorizontalDivider,
    useDeskproAppClient,
    useInitialisedDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { ClientStateIssue } from "../context/StoreProvider/types";
import {
    setEntityIssueService,
    getEntityCardListService,
} from "../services/entityAssociation";
import {
    createIssueCommentService,
    getUserReposGraphQLService,
    searchByIssueGraphQLService,
} from "../services/github";
import { IssueGQL, RepositoryGQL } from "../services/github/types";
import { useLogout } from "../hooks";
import { getEntityMetadata } from "../utils";
import { Issues, RepoSelect } from "../components/LinkIssue";
import { OptionRepository } from "../components/LinkIssue/RepoSelect/types";
import {
    Button,
    Loading,
    InputSearch,
} from "../components/common";

const getRepoOptions = (repos: RepositoryGQL[]): OptionRepository[] => {
    return repos
        .map(({ id, name, nameWithOwner }) => ({
            key: id,
            value: nameWithOwner,
            label: name,
            type: "value",
        }));
};

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
    const [loading, setLoading] = useState<boolean>(false);
    const [searchIssue, setSearchIssue] = useState<string>("");
    const [issues, setIssues] = useState<IssueGQL[]>([]);
    const [repoOptions, setRepoOptions] = useState<Array<OptionRepository>>([]);
    const [selectedRepo, setSelectedRepo] = useState<OptionRepository|null>(null);
    const [selectedIssues, setSelectedIssues] = useState<Array<IssueGQL["id"]>>([]);
    const [alreadyLinkedIssues, setAlreadyLinkedIssues] = useState<string[]>([]);
    const { logout } = useLogout();
    const ticketId = state.context?.data.ticket.id;
    const currentUserLogin = state.dataDeps?.currentUser.login;

    useInitialisedDeskproAppClient((client) => {
        if (!ticketId) {
            return;
        }

        getEntityCardListService(client, ticketId)
            .then(setAlreadyLinkedIssues)
            .catch(() => setAlreadyLinkedIssues([]));
    }, [ticketId]);

    useInitialisedDeskproAppClient((client) => {
        if (!currentUserLogin) {
            return;
        }

        getUserReposGraphQLService(client, currentUserLogin)
            .then((repos) => setRepoOptions([
                { key: "any", label: "Any", type: "value", value: "any" },
                ...getRepoOptions(repos),
            ]));
    }, [currentUserLogin])

    useEffect(() => {
        if (!isEmpty(repoOptions) && !isEmpty(repoOptions[0])) {
            setSelectedRepo(repoOptions[0]);
        }
    }, [repoOptions]);

    const onClearSearch = () => {
        setSearchIssue("");
        setIssues([]);
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

    const searchInGithub = useDebouncedCallback<(q: string) => void>((q) => {
        if (!client || !currentUserLogin) {
            return;
        }

        if (!q || q.length < 2) {
            setIssues([]);
            return;
        }

        setLoading(true);

        searchByIssueGraphQLService(client, q, currentUserLogin)
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
        searchInGithub(q);
    };

    const onChangeSelect = (option: OptionRepository) => {
        setSelectedRepo(option);
    };

    const onLinkIssues = () => {
        if (!client || !ticketId) {
            return;
        }

        const linkedIssues = issues.filter(({ id }) => selectedIssues.includes(id));

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
                return createIssueCommentService(client, {
                    repoFullName: issue.repository.nameWithOwner,
                    issueNumber: issue.number,
                    comment: `Linked to Deskpro ticket ${ticketId}${state.context?.data?.ticket?.permalinkUrl
                        ? `, ${state.context.data.ticket.permalinkUrl}`
                        : ""
                    }`
                });
            }),
        ])
        .then(() => navigate("/home"))
        .catch((error) => dispatch({ type: "error", error }));
    };

    return (
        <div style={{ minHeight: "500px" }}>
            <InputSearch
                value={searchIssue}
                onClear={onClearSearch}
                onChange={onChangeSearch}
            />

            <RepoSelect
                value={selectedRepo}
                options={repoOptions}
                onChange={onChangeSelect}
            />

            <Stack justify="space-between" style={{ paddingBottom: "4px" }}>
                <Button
                    disabled={selectedIssues.length === 0 || !selectedRepo?.value}
                    text="Link Issue"
                    onClick={onLinkIssues}
                />
                <Button
                    text="Cancel"
                    onClick={() => navigate("/home")}
                    intent="secondary"
                />
            </Stack>

            <HorizontalDivider style={{ marginBottom: 10 }}/>

            {loading
                ? (<Loading/>)
                : (
                    <>
                        <Issues
                            issues={flow([
                                filterByRepo(selectedRepo?.value),
                                filterByAlreadySelected(alreadyLinkedIssues),
                            ])(issues)}
                            selectedIssues={selectedIssues}
                            onChange={onChangeSelectedCard}
                        />
                    </>
                )
            }
        </div>
    );
};

export { AddIssue };
