import { useState, FC, ChangeEvent, useEffect } from "react";
import flow from "lodash/flow";
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";
import { useDebouncedCallback } from "use-debounce";
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
    searchByIssueGraphQLService,
} from "../services/github";
import { IssueGQL, Repository, RepositoryGQL } from "../services/github/types";
import { getEntityMetadata } from "../utils";
import { Issues } from "../components/LinkIssue";
import {
    Label,
    Button,
    Loading,
    InputSearch,
    SingleSelect,
} from "../components/common";

type OptionRepository = {
    key: RepositoryGQL["id"],
    value: RepositoryGQL["nameWithOwner"],
    label: Repository["name"],
    type: "value",
};

const getRepoOptions = (issues: IssueGQL[]): OptionRepository[] => {
    return issues
        .map(({ repository }) => ({
            key: repository.id,
            value: repository.nameWithOwner,
            label: repository.name,
            type: "value",
        }));
};

const getUniqRepo = (options: OptionRepository[]) => {
    return options.reduce((acc: OptionRepository[], option) => {
        if (!acc.some(({ value }) => value === option.value)) {
            acc.push(option);
        }

        return acc;
    }, []);
};

const filterByRepo = (selectedRepo?: string) => (issues: IssueGQL[]) => {
    return issues.filter(({ repository }) => ["any", repository.nameWithOwner].includes(selectedRepo || ""))
}

const filterByAlreadySelected = (alreadyLinkedIssues: string[]) => (issues: IssueGQL[]) => {
    return issues.filter(({ databaseId }) => !alreadyLinkedIssues.includes(`${databaseId}`));
};

const AddIssue: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [searchIssue, setSearchIssue] = useState<string>("");
    const [issues, setIssues] = useState<IssueGQL[]>([]);
    const [repoOptions, setRepoOptions] = useState<Array<OptionRepository>>([]);
    const [selectedRepo, setSelectedRepo] = useState<OptionRepository|null>(null);
    const [selectedIssues, setSelectedIssues] = useState<Array<IssueGQL["id"]>>([]);
    const [alreadyLinkedIssues, setAlreadyLinkedIssues] = useState<string[]>([]);
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

    useEffect(() => {
        if (isArray(issues) && !isEmpty(issues)) {
            const options = flow([
                getRepoOptions,
                getUniqRepo,
            ])(issues);

            setRepoOptions([
                { key: "any", label: "Any", type: "value", value: "any" },
                ...options,
            ]);
        }
    }, [issues]);

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
                if (error?.code === 401) {
                    dispatch({ type: "setAuth", isAuth: false });
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
        .then(() => dispatch({ type: "changePage", page: "home" }))
        .catch((error) => dispatch({ type: "error", error }));
    };

    return (
        <div style={{ minHeight: "500px" }}>
            <InputSearch
                value={searchIssue}
                onClear={onClearSearch}
                onChange={onChangeSearch}
            />

            <Label htmlFor="repository" label="Repository">
                <SingleSelect
                    showInternalSearch
                    id="repository"
                    label="Repository"
                    value={selectedRepo}
                    onChange={onChangeSelect}
                    options={repoOptions}
                />
            </Label>

            <Stack justify="space-between" style={{ paddingBottom: "4px" }}>
                <Button
                    disabled={selectedIssues.length === 0 || !selectedRepo?.value}
                    text="Link Issue"
                    onClick={onLinkIssues}
                />
                <Button
                    text="Cancel"
                    onClick={() => dispatch({ type: "changePage", page: "home" })}
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
