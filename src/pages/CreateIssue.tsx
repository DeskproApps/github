import { FC } from "react";
import {
    IDeskproClient,
    useDeskproAppClient,
} from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import {
    baseRequest,
    getProjectService,
    createIssueService,
    createProjectIssueCardService,
} from "../services/github";
import { setEntityIssueService } from "../services/entityAssociation";
import { getEntityMetadata } from "../utils";
import { IssueForm } from "../components/common";
import { Values as IssueFormValues } from "../components/common/IssueForm/types";
import {
    User,
    Issue,
    Project,
    Repository,
    ProjectColumn,
} from "../services/github/types";

const CreateIssue: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const repositories = state.dataDeps?.repositories as Repository[];
    const currentUser = state.dataDeps?.currentUser as User;
    const ticketId = state.context?.data.ticket.id;

    const createProjectIssueCard = (
        client: IDeskproClient,
        issue: Issue,
        projectId: Project["id"],
    ) => {
        return getProjectService(client, projectId)
            .then((project) => {
                return baseRequest<ProjectColumn[]>(client, { rawUrl: project.columns_url })
            })
            .then((columns) => {
                return createProjectIssueCardService(client, {
                    issueId: issue.id,
                    columnId: columns[0].id,
                })
            })
            .then(() => {
                return issue;
            });
    };

    const onSubmit = (values: IssueFormValues) => {
        if (!client || !ticketId) {
            return;
        }

        const newIssue = {
            title: values.title,
            body: values.description || "",
            milestone: !values.milestone.value ? null : values.milestone.value,
            ...((Array.isArray(values.assignees) && values.assignees.length > 0)
                    ? { assignees: values.assignees }
                    : {}
            ),
            // ...((Array.isArray(values.labels) && values.labels.length > 0)
            //     ? { labels: values.labels }
            //     : {}
            // ),
        };

        return createIssueService(client, {
            repoFullName: values.repository.value,
            data: newIssue,
        })
            .then((issue) => {
                if (!values.projects.value) {
                    return Promise.resolve(issue);
                } else {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    return createProjectIssueCard(client, issue, values.projects.value);
                }
            })
            .then((issue) => {
                return Promise.all([
                    setEntityIssueService(
                        client,
                        ticketId,
                        issue.id,
                        getEntityMetadata({
                            ...issue,
                            repository_name: values.repository.value,
                        })
                    ),
                    client.setState(`issues/${issue.id}`, { issueUrl: issue.url }),
                    baseRequest(client, {
                        rawUrl: issue.comments_url,
                        method: "POST",
                        data: {
                            body: `Linked to Deskpro ticket ${ticketId}${state.context?.data?.ticket?.permalinkUrl
                                ? `, ${state.context.data.ticket.permalinkUrl}`
                                : ""
                            }`,
                        },
                    }),
                ]);
            })
            .then(() => dispatch({ type: "changePage", page: "home" }));
    };

    return (
        <>
            <IssueForm
                repositories={repositories}
                currentUser={currentUser}
                onSubmit={onSubmit}
                onCancel={() => dispatch({ type: "changePage", page: "home" })}
            />
        </>
    );
};

export { CreateIssue };
