import { FC } from "react";
import { useNavigate } from "react-router-dom";
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
import {
    useDeskproLabel,
    useAutomatedComment,
} from "../hooks";
import { IssueForm } from "../components/IssueForm";
import { Values as IssueFormValues } from "../components/IssueForm/types";
import {
    User,
    Issue,
    Project,
    Repository,
    ProjectColumn,
} from "../services/github/types";

const CreateIssue: FC = () => {
    const navigate = useNavigate();
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const { createAutomatedLinkedComment } = useAutomatedComment();
    const { addDeskproLabel } = useDeskproLabel();
    const repositories = state.dataDeps?.repositories as Repository[];
    const currentUser = state.dataDeps?.currentUser as User;
    const ticketId = state.context?.data.ticket.id;

    const createProjectIssueCard = (
        client: IDeskproClient,
        issueId: Issue["id"],
        projectId: Project["id"],
    ) => {
        return getProjectService(client, projectId)
            .then((project) => {
                return baseRequest<ProjectColumn[]>(client, { rawUrl: project.columns_url })
            })
            .then((columns) => {
                return createProjectIssueCardService(client, {
                    issueId,
                    columnId: columns[0].id,
                })
            });
    };

    const onSubmit = (values: IssueFormValues) => {
        if (!client || !ticketId) {
            return;
        }

        const newIssue = {
            title: values.title,
            body: values.description || "",
            labels: values.labels,
            milestone: !values.milestone.value ? null : values.milestone.value,
            ...((Array.isArray(values.assignees) && values.assignees.length > 0)
                    ? { assignees: values.assignees }
                    : {}
            ),
        };

        dispatch({ type: "error", error: null })

        return createIssueService(client, {
            repoFullName: values.repository.value,
            data: newIssue,
        })
            .then((issue) => {
                if (Array.isArray(values.projects) && values.projects.length > 0) {
                    return Promise.all(values.projects.map((projectId) => {
                        return createProjectIssueCard(client, issue.id, projectId)
                    }))
                        .then(() => issue);
                } else {
                    return issue;
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
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            repository: {
                                nameWithOwner: values.repository.value
                            },
                        })
                    ),
                    client.setState(`issues/${issue.id}`, { issueUrl: issue.url }),
                    createAutomatedLinkedComment(issue.comments_url),
                    addDeskproLabel(issue),
                ]);
            })
            .then(() => navigate("/home"))
            .catch((error) => dispatch({ type: "error", error }));
    };

    return (
        <IssueForm
            repositories={repositories}
            currentUser={currentUser}
            onSubmit={onSubmit}
            onCancel={() => navigate("/home")}
        />
    );
};

export { CreateIssue };
