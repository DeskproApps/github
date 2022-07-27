import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Issue, ProjectColumn } from "./types";

export type Params = {
    issueId: Issue["id"],
    columnId: ProjectColumn["id"],
    contentType?: "Issue" | "PullRequest",
}

const createProjectIssueCardService = (
    client: IDeskproClient,
    { issueId, columnId }: Params,
) => {
    return baseRequest(client, {
        url: `/projects/columns/${columnId}/cards`,
        method: "POST",
        data: {
            content_id: issueId,
            content_type: "Issue",
        },
    })
};

export { createProjectIssueCardService };
