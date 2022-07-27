import { IDeskproClient } from "@deskpro/app-sdk";
import { baseRequest } from "./baseRequest";
import { Issue, User, Repository, Milestone/*, Label*/ } from "./types";

export type Params = {
    repoFullName: Repository["full_name"],
    data: {
        title: Issue["title"],
        body: Issue["body"],
        milestone: Milestone["id"] | null,
        assignees: User["login"],
        // projects: Project["id"],
        // labels: Array<Label["id"]>,
    },
};

const createIssueService = (client: IDeskproClient, {
    repoFullName,
    data,
}: Params) => {
    return baseRequest<Issue>(client, {
        url: `/repos/${repoFullName}/issues`,
        method: "POST",
        data,
    });
};

export { createIssueService };
