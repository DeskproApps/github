import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Issue, Repository, Comment } from "./types";
import { BASE_URL } from "./constants";

export type Params = {
    repoFullName: Repository["full_name"],
    issueNumber: Issue["number"],
    comment: string,
};

export const getIssueCommentUrl = (repoFullName: string, issueNumber: number): string => {
    return `${BASE_URL}/repos/${repoFullName}/issues/${issueNumber}/comments`
};

const createIssueCommentService = (client: IDeskproClient, {
    repoFullName,
    issueNumber,
    comment,
}: Params) => {
    return baseRequest<Comment>(client, {
        url: `/repos/${repoFullName}/issues/${issueNumber}/comments`,
        method: "POST",
        data: { body: comment },
    });
};

export { createIssueCommentService };
