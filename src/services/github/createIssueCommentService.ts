import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Issue, Repository } from "./types";

export type Params = {
    repoFullName: Repository["full_name"],
    issueNumber: Issue["number"],
    comment: string,
};

const createIssueCommentService = (client: IDeskproClient, {
    repoFullName,
    issueNumber,
    comment,
}: Params) => {
    return baseRequest<Issue>(client, {
        url: `/repos/${repoFullName}/issues/${issueNumber}/comments`,
        method: "POST",
        data: { body: comment },
    });
};

export { createIssueCommentService };
