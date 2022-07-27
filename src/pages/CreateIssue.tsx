import { FC } from "react";
import { useDeskproAppClient } from "@deskpro/app-sdk";
import { useStore } from "../context/StoreProvider/hooks";
import {
    baseRequest,
    createIssueService,
} from "../services/github";
import { setEntityIssueService } from "../services/entityAssociation";
import { getEntityMetadata } from "../utils";
import { IssueForm } from "../components/common";
import { Values as IssueFormValues } from "../components/common/IssueForm/types";
import { Repository } from "../services/github/types";

const CreateIssue: FC = () => {
    const { client } = useDeskproAppClient();
    const [state, dispatch] = useStore();
    const repositories = state.dataDeps?.repositories as Repository[];
    const ticketId = state.context?.data.ticket.id;

    return (
        <>
            <IssueForm
                repositories={repositories}
                onSubmit={(values: IssueFormValues) => {
                    if (!client || !ticketId) {
                        return;
                    }

                    return createIssueService(client, {
                        repoFullName: values.repository.value,
                        data: {
                            title: values.title,
                            body: values.description || "",
                            milestone: !values.milestone.value ? null : values.milestone.value,
                            ...((Array.isArray(values.assignees) && values.assignees.length > 0)
                                ? { assignees: values.assignees }
                                : {}
                            ),
                            // ...((Array.isArray(values.projects) && values.projects.length > 0)
                            //     ? { projects: values.projects }
                            //     : {}
                            // ),
                            // ...((Array.isArray(values.labels) && values.labels.length > 0)
                            //     ? { labels: values.labels }
                            //     : {}
                            // ),
                        },
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
                }}
                onCancel={() => dispatch({ type: "changePage", page: "home" })}
            />
        </>
    );
};

export { CreateIssue };
