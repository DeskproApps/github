import { useState, FC, ChangeEvent, useEffect } from "react";
import flow from "lodash/flow";
import isArray from "lodash/isArray";
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
    searchByIssueGraphQLService,
} from "../services/github";
import { Issue, Repository } from "../services/github/types";
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
    key: Repository["id"],
    value: Repository["full_name"],
    label: Repository["name"],
    type: "value",
};

const getRepoOptions = (issues) => {
    return issues
        .map(({ repository }) => ({
            key: repository.id,
            value: repository.nameWithOwner,
            label: repository.name,
            type: "value",
        }));
};

const getUniqRepo = (options) => {
    return options.reduce((acc, option) => {
        if (!acc.some(({ value }) => value === option.value)) {
            acc.push(option);
        }

        return acc;
    }, []);
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
    const currentUserLogin = state.dataDeps?.currentUser.login;

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

        linkedIssues.map((issue) => {
            const metadata = getEntityMetadata(issue);
            console.log(">>> metadata:", metadata);
        })

        // Promise.all(
        //     linkedIssues.map(({ repository_url }) => baseRequest<Repository[]>(client, { rawUrl: repository_url }))
        // )
        //     .then((repositories) => {
        //         const repos: Record<Repository["url"], Repository> = repositories.reduce((acc, repo) => {
        //             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //             // @ts-ignore
        //             acc[repo.url] = repo;
        //             return acc;
        //         }, {});
        //
        //         return linkedIssues.map((issue) => {
        //             if (repos[issue.repository_url])    {
        //                 issue.repository_name =  repos[issue.repository_url].full_name;
        //             }
        //
        //             return issue;
        //         });
        //     })
        //     .then((issuesForSave) => {
            Promise.all([
                ...linkedIssues.map((issue) => setEntityIssueService(
                    client,
                    ticketId,
                    issue.databaseId, // ToDo: issue.databaseId || issue.id
                    getEntityMetadata(issue),
                )),
                ...linkedIssues.map((issue) => {
                    return client.setState<ClientStateIssue>(
                        `issues/${issue.databaseId}`,
                        { issueUrl: issue.resourcePath, nodeId: issue.id },
                    );
                }),

                // setEntityIssueService(
                //     client,
                //     ticketId,
                //     1329931768,
                //     {"id":1329931768,"title":"One more test issue","repository":"zpawn/learn.js","milestone":"","projects":[],"assignees":[],"labels":[],"createdAt":"2022-08-05T13:19:20Z"},
                // ),
                // client.setState<ClientStateIssue>(
                //     `issues/1329931768`,
                //     { issueUrl: "https://api.github.com/repos/zpawn/learn.js/issues/148" },
                // )

                // ...linkedIssues.map((issue) => {
                //     return baseRequest(client, {
                //         rawUrl: issue.comments_url,
                //         method: "POST",
                //         data: {
                //             body: `Linked to Deskpro ticket ${ticketId}${state.context?.data?.ticket?.permalinkUrl
                //                 ? `, ${state.context.data.ticket.permalinkUrl}`
                //                 : ""
                //             }`,
                //         },
                //     });
                // })
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
                            issues={issues.filter(
                                ({ repository }) => ["any", repository.nameWithOwner].includes(selectedRepo?.value))
                            }
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
