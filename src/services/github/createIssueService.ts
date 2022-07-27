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

/**
 * @see https://docs.github.com/en/rest/issues/issues#create-an-issue
 * Notes:
 * - Milestone: only users with push access can set the milestone for new issues.
 *              The milestone is silently dropped otherwise.
 */
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
