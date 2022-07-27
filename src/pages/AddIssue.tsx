import { useState, FC, ChangeEvent, useEffect } from "react";
import isEmpty from "lodash/isEmpty";
import { useDebouncedCallback } from "use-debounce";
import {
    Stack,
    HorizontalDivider,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import { ClientStateIssue } from "../context/StoreProvider/types";
import { setEntityIssueService } from "../services/entityAssociation";
import {
    baseRequest,
    searchByIssueService,
} from "../services/github";
import { Issue, Repository } from "../services/github/types";
import { getEntityMetadata } from "../utils";
import { Issues } from "../components/LinkIssue";
import {
    Button,
    Loading,
    InputSearch,
    SingleSelect,
} from "../components/common";

type OptionRepository = {
    key: Repository["id"],
    value: Repository["full_name"],
    label: Repository["name"],
    type: "value",
};

const AddIssue: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const [loading, setLoading] = useState<boolean>(false);
    const [searchIssue, setSearchIssue] = useState<string>("");
    const [issues, setIssues] = useState<Issue[]>([]);
    const [repoOptions, setRepoOptions] = useState<Array<OptionRepository>>([]);
    const [selectedRepo, setSelectedRepo] = useState<OptionRepository|null>(null);
    const [selectedIssues, setSelectedIssues] = useState<Array<Issue["id"]>>([]);
    const ticketId = state.context?.data.ticket.id;

    useEffect(() => {
        if (!isEmpty(state.dataDeps?.repositories)) {
            setRepoOptions((state.dataDeps?.repositories as Repository[]).map((repo) => ({
                key: repo.id,
                value: repo.full_name,
                label: repo.name,
                type: "value",
            })));
        }
    }, [state.dataDeps?.repositories]);

    useEffect(() => {
        if (!isEmpty(repoOptions) && !isEmpty(repoOptions[0])) {
            setSelectedRepo(repoOptions[0]);
        }
    }, [repoOptions]);

    const onClearSearch = () => {
        setSearchIssue("");
        setIssues([]);
    };

    const onChangeSelectedCard = (issueId: Issue["id"]) => {
        let newSelectedIssues = [...selectedIssues];
        if (selectedIssues.includes(issueId)) {
            newSelectedIssues = selectedIssues.filter((selectedIssueId) => selectedIssueId !== issueId);
        } else {
            newSelectedIssues.push(issueId);
        }
        setSelectedIssues(newSelectedIssues);
    };

    const searchInGithub = useDebouncedCallback<(q: string) => void>((q) => {
        if (!client || !selectedRepo?.value) {
            return;
        }

        if (!q || q.length < 2) {
            setIssues([]);
            return;
        }

        setLoading(true);

        searchByIssueService(client, q, selectedRepo.value)
            .then(({ items }) => setIssues(items))
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
        searchInGithub(searchIssue);
    };

    const onLinkIssues = () => {
        if (!client || !ticketId) {
            return;
        }

        const linkedIssues = issues.filter(({ id }) => selectedIssues.includes(id));

        Promise.all(
            linkedIssues.map(({ repository_url }) => baseRequest<Repository[]>(client, { rawUrl: repository_url }))
        )
            .then((repositories) => {
                const repos: Record<Repository["url"], Repository> = repositories.reduce((acc, repo) => {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    acc[repo.url] = repo;
                    return acc;
                }, {});

                return linkedIssues.map((issue) => {
                    if (repos[issue.repository_url])    {
                        issue.repository_name =  repos[issue.repository_url].full_name;
                    }

                    return issue;
                });
            })
            .then((issuesForSave) => {
                return Promise.all([
                    ...issuesForSave.map((issue) => setEntityIssueService(
                        client,
                        ticketId,
                        issue.id,
                        getEntityMetadata(issue),
                    )),
                    ...issuesForSave.map((issue) => {
                        return client.setState<ClientStateIssue>(
                            `issues/${issue.id}`,
                            { issueUrl: issue.url },
                        );
                    }),
                    ...issuesForSave.map((issue) => {
                        return baseRequest(client, {
                            rawUrl: issue.comments_url,
                            method: "POST",
                            data: {
                                body: `Linked to Deskpro ticket ${ticketId}${state.context?.data?.ticket?.permalinkUrl
                                    ? `, ${state.context.data.ticket.permalinkUrl}`
                                    : ""
                                }`,
                            },
                        });
                    })
                ])
            })
            .then(() => dispatch({ type: "changePage", page: "home" }))
            .catch((error) => dispatch({ type: "error", error }));
    };

    return (
        <div style={{ minHeight: "500px" }}>
            <InputSearch
                disabled={!selectedRepo?.value}
                value={searchIssue}
                onClear={onClearSearch}
                onChange={onChangeSearch}
            />

            <SingleSelect
                showInternalSearch
                label="Repository"
                value={selectedRepo}
                onChange={onChangeSelect}
                options={repoOptions}
            />

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
                            issues={issues}
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
